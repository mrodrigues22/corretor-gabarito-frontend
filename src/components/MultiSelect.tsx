import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Search } from 'lucide-react';

interface Option {
    id: string;
    label: string;
    sublabel?: string;
}

interface MultiSelectProps {
    options: Option[];
    value: string[];
    onChange: (value: string[]) => void;
    placeholder?: string;
    required?: boolean;
    className?: string;
}

export const MultiSelect = ({ options, value, onChange, placeholder = "Selecione...", required = false, className = "" }: MultiSelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const selectedOptions = options.filter(option => value.includes(option.id));
    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (option.sublabel && option.sublabel.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [isOpen]);

    const handleSelect = (optionId: string) => {
        const newValue = value.includes(optionId)
            ? value.filter(id => id !== optionId)
            : [...value, optionId];
        onChange(newValue);
    };

    const handleRemove = (optionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onChange(value.filter(id => id !== optionId));
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            setSearchTerm('');
        }
    };

    return (
        <div className="relative" ref={containerRef}>
            <div
                className={`w-full h-12 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className} ${required && value.length === 0 ? 'border-red-500' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="flex flex-wrap gap-1 items-center pr-6">
                    {selectedOptions.length > 0 ? (
                        <>
                            {selectedOptions.slice(0, 2).map(option => (
                                <span
                                    key={option.id}
                                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white text-sm rounded-md"
                                >
                                    {option.label}
                                    <button
                                        type="button"
                                        onClick={(e) => handleRemove(option.id, e)}
                                        className="hover:bg-blue-700 rounded-full p-0.5"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            {selectedOptions.length > 2 && (
                                <span className="text-slate-400 text-sm px-2 py-1">
                                    +{selectedOptions.length - 2} mais
                                </span>
                            )}
                        </>
                    ) : (
                        <span className="text-slate-500">{placeholder}</span>
                    )}
                </div>
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-lg max-h-60 overflow-hidden">
                    <div className="p-2 border-b border-slate-700">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full pl-10 pr-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                        </div>
                    </div>

                    <div className="max-h-48 overflow-y-auto">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map(option => {
                                const isSelected = value.includes(option.id);
                                return (
                                    <div
                                        key={option.id}
                                        onClick={() => handleSelect(option.id)}
                                        className={`px-3 py-2 cursor-pointer hover:bg-slate-700 ${isSelected ? 'bg-blue-600/20' : ''}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className={`w-4 h-4 border border-slate-500 rounded flex items-center justify-center ${isSelected ? 'bg-blue-500 border-blue-500' : ''}`}>
                                                {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                            </div>
                                            <div>
                                                <div className="text-white text-sm">{option.label}</div>
                                                {option.sublabel && (
                                                    <div className="text-slate-400 text-xs">{option.sublabel}</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="px-3 py-4 text-center text-slate-500 text-sm">
                                Nenhum resultado encontrado
                            </div>
                        )}
                    </div>

                    {selectedOptions.length > 0 && (
                        <div className="p-2 border-t border-slate-700 bg-slate-800/50">
                            <div className="text-xs text-slate-400">
                                {selectedOptions.length} selecionado{selectedOptions.length !== 1 ? 's' : ''}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};