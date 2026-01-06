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

const StudentsNotification = () => {
    const [loading, setLoading] = useState(false)
    const [shouldReset, setShouldReset] = useState(false)
    const dispatch: AppDispatch = useDispatch()

    const handleFormSubmit = async (data: {
        image: File | null;
        studentId: string;
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
                type: "student",
                sendType: data.studentId ? "individual" : "all",
                imageUrl: imageUrl,
                studentId: data.studentId || null,
                caption: data.caption,
                description: data.description,
                createdAt: serverTimestamp() as Timestamp,
                createdBy: currentUser.uid,
            }

            await setDoc(noticeRef, notificationData)
            dispatch(addNotification({ notificationType: "student", notification: notificationData }))


             // @todo uncomment this when app is ready

            // Send Notification - call cloud function

            // ✅ Get Firebase ID token
            // const idToken = await currentUser.getIdToken();

            // ✅ Cloud Function URL
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
            //         ...(notificationData.sendType === "all" ? { topic: "student" } : { token: notificationData.studentId }),
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
                    type="student"
                    onSubmit={handleFormSubmit}
                    loading={loading}
                    shouldReset={shouldReset}
                />
            </div>
            <OldNotices type="student" />
            {loading && <FormLoading />}
        </div>
    )
}

export default StudentsNotification
