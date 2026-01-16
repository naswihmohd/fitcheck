import { IoMdArrowRoundBack } from 'react-icons/io'
import { useNavigate, useLocation } from 'react-router'

const BackButton = () => {
    const navigate = useNavigate()
    const location = useLocation()

    const handleGoBack = () => {
        const currentPath = location.pathname
        
        // Handle specific route patterns for smart navigation
        if (currentPath.includes('/employee-management/') && currentPath.split('/').length > 2) {
            // If we're in a child route of employee-management, go back to main employee-management
            navigate('/employee-management')
        } else {
            // Default behavior: go back in browser history
            navigate(-1)
        }
    }

    return (
        <button
            onClick={handleGoBack}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors p-2"
        >
            <IoMdArrowRoundBack size={20} />
        </button>
    )
}

export default BackButton
