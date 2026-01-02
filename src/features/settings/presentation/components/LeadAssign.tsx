import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useSelector, useDispatch } from 'react-redux'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../../../firebaseConfig'
import type { RootState, AppDispatch } from '../../../../general/redux/store'
import { setBranchData } from '../../../login/redux/authSlice'
import toast from 'react-hot-toast'

interface SettingToggleProps {
    title: string
    enabled: boolean
    onToggle: () => void
    index: number
    loading?: boolean
}

const SettingToggle: React.FC<SettingToggleProps> = ({ title, enabled, onToggle, index, loading = false }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm p-6 flex items-center justify-between"
            style={{
                boxShadow: '0px 0.92px 2.75px 0px #0051AF1A',
            }}
        >
            <span className="text-base font-medium text-gray-900">{title}</span>
            <div className="flex flex-col items-center gap-1">
                <span className={`text-xs font-medium ${enabled ? 'text-[#0A8316]' : 'text-red-500'}`}>
                    {enabled ? 'Enable' : 'Disable'}
                </span>
                <button
                    onClick={onToggle}
                    disabled={loading}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer ${enabled ? 'bg-[#0A8316]' : 'bg-red-300'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 ${enabled ? 'translate-x-6' : 'translate-x-0'
                            }`}
                    />
                </button>
            </div>
        </motion.div>
    )
}

const LeadAssign = () => {
    const { branchData } = useSelector((state: RootState) => state.user)
    const dispatch: AppDispatch = useDispatch()
    const [shuffleLeads, setShuffleLeads] = useState(true)
    const [claimingLeads, setClaimingLeads] = useState(false)
    const [loading, setLoading] = useState(false)

    // Load initial values from branchData
    useEffect(() => {
        if (branchData?.leadSettings) {
            setShuffleLeads(branchData.leadSettings.shuffleLeads ?? false)
            setClaimingLeads(branchData.leadSettings.claimingLeads ?? false)
        }
    }, [branchData])

    const updateGeneralSettings = async (updates: { shuffleLeads?: boolean; claimingLeads?: boolean }) => {
        if (!branchData) {
            toast.error("Branch data not found")
            return
        }

        try {
            setLoading(true)
            const updatedLeadSettings = {
                ...branchData.leadSettings,
                ...updates,
            }

            // Update Firestore
            const branchRef = doc(db, "branches", branchData.id)
            await updateDoc(branchRef, {
                leadSettings: updatedLeadSettings,
            })

            // Update Redux state
            dispatch(setBranchData({
                ...branchData,
                leadSettings: updatedLeadSettings,
            }))

        } catch (error: any) {
            console.error("Error updating settings:", error)
            toast.error(error.message || "Failed to update settings")
        } finally {
            setLoading(false)
        }
    }

    const handleShuffleLeadsToggle = async () => {
        const newValue = !shuffleLeads
        setShuffleLeads(newValue)
        // If enabling shuffle leads, disable claiming leads
        if (newValue) {
            setClaimingLeads(false)
            await updateGeneralSettings({ shuffleLeads: newValue, claimingLeads: false })
        } else {
            await updateGeneralSettings({ shuffleLeads: newValue })
        }
    }

    const handleClaimingLeadsToggle = async () => {
        const newValue = !claimingLeads
        setClaimingLeads(newValue)
        // If enabling claiming leads, disable shuffle leads
        if (newValue) {
            setShuffleLeads(false)
            await updateGeneralSettings({ claimingLeads: newValue, shuffleLeads: false })
        } else {
            await updateGeneralSettings({ claimingLeads: newValue })
        }
    }

    return (
        <div className="space-y-4">
            <SettingToggle
                title="Shuffle leads"
                enabled={shuffleLeads}
                onToggle={handleShuffleLeadsToggle}
                index={0}
                loading={loading}
            />
            <SettingToggle
                title="Claiming leads"
                enabled={claimingLeads}
                onToggle={handleClaimingLeadsToggle}
                index={1}
                loading={loading}
            />
        </div>
    )
}

export default LeadAssign
