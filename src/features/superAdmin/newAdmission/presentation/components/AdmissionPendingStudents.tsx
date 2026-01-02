
import StudentCard from './StudentCard'
import { dummyStudents } from '../NewAdmission'

const AdmissionPendingStudents = () => {
    return (
        <>
            {/* Student Cards List */}
            <div className="space-y-3 mb-4">
                {dummyStudents.length > 0 ? (
                    dummyStudents.map((student, idx) => (
                        <StudentCard key={student.id} data={student} index={idx} />
                    ))
                ) : (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-sm text-gray-500">
                            No students found.
                        </p>
                    </div>
                )}
            </div>
        </>
    )
}

export default AdmissionPendingStudents
