import { useState } from 'react'
import NoticeBoardForm from './NoticeBoardForm'
import OldNotices from './OldNotices'
import { auth, db, storage } from '../../../../../firebaseConfig'
import { collection, doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import toast from 'react-hot-toast'
import FormLoading from '../../../../../general/components/FormLoading'
import { addNotification } from '../../redux/notificationSlice'
import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../../../../../general/redux/store'
import type { NotificationProps } from '../../data/notificationTypes'

const BranchesNotification = () => {
    const [loading, setLoading] = useState(false)
    const [shouldReset, setShouldReset] = useState(false)
    const dispatch: AppDispatch = useDispatch()

    const handleFormSubmit = async (data: {
        image: File | null;
        branchId?: string;
        caption: string;
        description: string;
    }) => {
        try {
            setLoading(true)
            setShouldReset(false)

            const currentUser = auth.currentUser
            if (!currentUser) {
                throw new Error("User not authenticated")
            }

            // Create notification document reference
            const noticeRef = doc(collection(db, "notifications"))
            let imageUrl = null

            // Upload image to storage if provided
            if (data.image) {
                const storageRef = ref(storage, `notifications/${noticeRef.id}`)
                await uploadBytes(storageRef, data.image)
                imageUrl = await getDownloadURL(storageRef)
            }

            // Create notification document
            const notificationData: NotificationProps = {
                id: noticeRef.id,
                type: "branches",
                sendType: data.branchId ? "individual" : "all",
                branchId: data.branchId || null,
                imageUrl: imageUrl,
                caption: data.caption,
                description: data.description,
                createdAt: serverTimestamp() as Timestamp,
                createdBy: currentUser.uid,
            }

            await setDoc(noticeRef, notificationData)
            dispatch(addNotification({ notificationType: "branches", notification: notificationData }))
            setShouldReset(true)
            toast.success("Notification sent successfully!")

        } catch (error: any) {
            console.error("❌ Error creating notification:", error)
            toast.error(error.message || "An unexpected error occurred")
            setShouldReset(false)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
            <div className='col-span-2 border-r px-2 border-primary/10'>
                <NoticeBoardForm
                    type="branches"
                    onSubmit={handleFormSubmit}
                    loading={loading}
                    shouldReset={shouldReset}
                />
            </div>
            <OldNotices type="branches" />
            {loading && <FormLoading />}
        </div>
    )
}

export default BranchesNotification
