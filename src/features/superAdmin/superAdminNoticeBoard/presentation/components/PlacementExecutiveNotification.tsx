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
import { CloudFunctionsURLs } from '../../../../../general/constants/constants'
import type { NotificationProps } from '../../data/notificationTypes'

const PlacementExecutiveNotification = () => {
    const [loading, setLoading] = useState(false)
    const [shouldReset, setShouldReset] = useState(false)
    const dispatch: AppDispatch = useDispatch()

    const handleFormSubmit = async (data: {
        image: File | null;
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
                type: "placement-executive",
                sendType: "all",
                imageUrl: imageUrl,
                caption: data.caption,
                description: data.description,
                createdAt: serverTimestamp() as Timestamp,
                createdBy: currentUser.uid,
            }

            await setDoc(noticeRef, notificationData)
            dispatch(addNotification({ notificationType: "placement-executive", notification: notificationData }))

            // Send Notification - call cloud function

            // @todo uncomment this when app is ready

            // ✅ Get Firebase ID token
            // const idToken = await currentUser.getIdToken();

            // // ✅ Cloud Function URL
            // const url = CloudFunctionsURLs.SEND_NOTIFICATION;
            // if (!url) throw new Error("Cloud Function URL not configured");


            // // ✅ Make HTTPS request
            // const response = await fetch(url, {
            //     method: "POST",
            //     headers: {
            //         Authorization: `Bearer ${idToken}`,
            //         "Content-Type": "application/json",
            //         Accept: "application/json",
            //     },
            //     body: JSON.stringify({
            //         topic: "placement-executive",
            //         body: data.description,
            //         title: data.caption,
            //         imageUrl: imageUrl,
            //     }),
            // });

            // // ✅ Parse JSON response
            // const result = await response.json();

            // // ✅ Handle response cases
            // if (!response.ok) {
            //     console.error("Send notification failed:", result);
            //     toast.error(result.message || "Failed to send notification");
            //     return;
            // }
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
                    type="placement-executive"
                    onSubmit={handleFormSubmit}
                    loading={loading}
                    shouldReset={shouldReset}
                />
            </div>
            <OldNotices type="placement-executive" />
            {loading && <FormLoading />}
        </div>
    )
}

export default PlacementExecutiveNotification
