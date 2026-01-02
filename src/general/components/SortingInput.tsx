import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoIosArrowDown } from 'react-icons/io';
import sortIcon from '../../assets/icons/sort-icon.svg';

export type SortOption = 'Date (Newest)' | 'Date (Oldest)' | 'Name (A-Z)' | 'Name (Z-A)';

interface SortingInputProps {
    value: SortOption;
    onChange: (value: SortOption) => void;
}

const sortOptions: SortOption[] = [
    'Date (Newest)',
    'Date (Oldest)',
    'Name (A-Z)',
    'Name (Z-A)',
];

const SortingInput: React.FC<SortingInputProps> = ({ value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleOptionSelect = (option: SortOption) => {
        onChange(option);
        setIsOpen(false);
    };

    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div ref={containerRef} className={`relative w-full max-w-md`}>
            {/* Header Button */}
            <button
                onClick={toggleDropdown}
                className="w-full flex items-center justify-between px-4 py-3 bg-[#EBF1FC] hover:bg-primary/5 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-2">
                    <img src={sortIcon} alt="sort-icon" className="w-6 h-6" />
                    <span className="text-sm text-nowrap font-medium text-black">
                        Sorting By : <span className="text-secondary">{value}</span>
                    </span>
                </div>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                    <IoIosArrowDown className="text-gray-400" size={18} />
                </motion.div>
            </button>

            {/* Dropdown Options */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{
                            duration: 0.2,
                            ease: [0.25, 0.46, 0.45, 0.94],
                        }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
                    >
                        <div className="py-2">
                            {sortOptions.map((option, index) => (
                                <motion.label
                                    key={option}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{
                                        duration: 0.15,
                                        delay: index * 0.05,
                                        ease: 'easeOut',
                                    }}
                                    className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                                        value === option ? 'bg-primary/5' : ''
                                    }`}
                                >
                                    <div className="relative flex items-center">
                                        <input
                                            type="radio"
                                            name="sortOption"
                                            value={option}
                                            checked={value === option}
                                            onChange={() => handleOptionSelect(option)}
                                            className="sr-only"
                                        />
                                        <div
                                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                                                value === option
                                                    ? 'border-secondary bg-secondary'
                                                    : 'border-gray-300 bg-white'
                                            }`}
                                        >
                                            {value === option && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="w-2 h-2 rounded-full bg-white"
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <span
                                        className={`text-sm font-medium ${
                                            value === option ? 'text-secondary' : 'text-gray-700'
                                        }`}
                                    >
                                        {option}
                                    </span>
                                </motion.label>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SortingInput;

