import React, { useEffect, useRef, useState } from 'react';
import { RiCheckLine, RiCloseLine } from 'react-icons/ri';
import { AngleUp } from '../../../icons/icons';

const CustomSelect = ({
    data = [],
    selectedItem = null,
    onSelectionChange,
    onSearch,
    placeholder = "Select item...",
    searchPlaceholder = "Search...",
    displayKey = "name",
    searchKey = "name",
    iconKey = "flag",
    showIcon = true,
    icon = "",
    color = "#000", // Default color
    rightIcon = "",
    maxHeight = "200px",
    disabled = false,
    className = "",
    loading = false,
    emptyMessage = "No items found",
    allowClear = true
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);
    const searchInputRef = useRef(null);

    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Call onSearch when search query changes
    useEffect(() => {
        if (onSearch) {
            onSearch(searchQuery);
        }
    }, [searchQuery, onSearch]);

    // Auto-focus search input when dropdown opens
    useEffect(() => {
        if (isOpen && searchInputRef.current) {
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    // Filter data based on search query (client-side filtering as backup)
    const filteredData = searchQuery && !onSearch
        ? data.filter(item =>
            item[searchKey]?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : data;

    // Handle item selection
    const selectItem = (item) => {
        if (disabled) return;

        // If clicking the same item, optionally deselect it
        const isSameItem = selectedItem && selectedItem[displayKey] === item[displayKey];
        const newSelection = isSameItem ? null : item;

        onSelectionChange?.(newSelection);
        setIsOpen(false);
        setSearchQuery(''); // Clear search when item is selected
    };

    // Clear selection
    const clearSelection = (e) => {
        e.stopPropagation(); // Prevent dropdown from opening
        if (disabled) return;
        onSelectionChange?.(null);
        setSearchQuery('');
    };

    // Check if item is selected
    const isItemSelected = (item) => {
        return selectedItem && selectedItem[displayKey] === item[displayKey];
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
    };

    // Handle dropdown toggle
    const toggleDropdown = () => {
        if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) {
                setSearchQuery(''); // Clear search when opening
            }
        }
    };

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            setSearchQuery('');
        }
    };

    return (
        <div className={`language-selection-container ${className}`}>
            <div className="language-dropdown-container" ref={dropdownRef}>
                <div
                    className={`language-dropdown-header ${disabled ? 'disabled' : ''} ${isOpen ? 'open' : ''}`}
                    onClick={toggleDropdown}
                >
                    <div className={`language-dropdown-inner`}>
                        {showIcon && (
                            <div className="globe-icon">
                                {selectedItem && selectedItem[iconKey] ? (
                                    <img src={selectedItem[iconKey]} alt={selectedItem[displayKey]} />
                                ) : (
                                    icon
                                )}
                            </div>
                        )}
                        <div 
                            className="header-text fs_16" 
                            style={{ 
                                color: selectedItem ? color : "#99A0AE" 
                            }}
                        >
                            {selectedItem
                                ? selectedItem[displayKey]
                                : placeholder
                            }
                        </div>
                        <div className="">
                            {allowClear && selectedItem ? (
                                <div
                                    className="clear-button"
                                    onClick={clearSelection}
                                    style={{ 
                                        cursor: 'pointer', 
                                    }}
                                >
                                    <RiCloseLine className='w-[19px] h-[19px] relative left-1' style={{ color: '#99A0AE' }} />
                                </div>
                            ) : (
                                <div className="dropdown-arrow">
                                    {rightIcon || (
                                        <img
                                            src={AngleUp}
                                            alt=''
                                            className={`w-[10px] h-[10px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {isOpen && (
                    <div className="language-dropdown-menu" style={{ maxHeight }}>
                        <div className="search-container">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.16667 15.8333C12.8486 15.8333 15.8333 12.8486 15.8333 9.16667C15.8333 5.48477 12.8486 2.5 9.16667 2.5C5.48477 2.5 2.5 5.48477 2.5 9.16667C2.5 12.8486 5.48477 15.8333 9.16667 15.8333Z" stroke="#A0A0A0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M17.5 17.5L13.875 13.875" stroke="#A0A0A0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchQuery}
                                onChange={handleSearchChange}
                                onKeyDown={handleKeyDown}
                                autoComplete="off"
                            />
                        </div>

                        <div className="language-options" style={{ overflowY: 'auto', maxHeight: 'calc(100% - 60px)' }}>
                            {loading ? (
                                <div className="loading-message" style={{ 
                                    padding: '12px 16px', 
                                    textAlign: 'center', 
                                    color: '#666',
                                    fontSize: '14px'
                                }}>
                                    Loading...
                                </div>
                            ) : !data || data.length === 0 ? (
                                <div className="empty-message" style={{ 
                                    padding: '12px 16px', 
                                    textAlign: 'center', 
                                    color: '#666',
                                    fontSize: '14px'
                                }}>
                                    No data available
                                </div>
                            ) : filteredData?.length === 0 ? (
                                <div className="empty-message" style={{ 
                                    padding: '12px 16px', 
                                    textAlign: 'center', 
                                    color: '#666',
                                    fontSize: '14px'
                                }}>
                                    {searchQuery?.length >= 2 ? emptyMessage : 'Start typing to search...'}
                                </div>
                            ) : (
                                filteredData?.map((item, index) => (
                                    <div
                                        key={item.id || `${item[displayKey]}-${index}`}
                                        className={`language-option ${isItemSelected(item) ? 'selected' : ''}`}
                                        onClick={() => selectItem(item)}
                                        style={{
                                            padding: '12px 16px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            borderRadius:'12px',
                                            borderBottom: '1px solid #f0f0f0',
                                            marginTop:'8px',
                                            backgroundColor: isItemSelected(item) ? '#f8f9fa' : 'transparent'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isItemSelected(item)) {
                                                e.target.style.backgroundColor = '#f8f9fa';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isItemSelected(item)) {
                                                e.target.style.backgroundColor = 'transparent';
                                            }
                                        }}
                                    >
                                        {showIcon && item[iconKey] && (
                                            <div className="flag-icon">
                                                <img 
                                                    src={item[iconKey]} 
                                                    alt={item[displayKey]}
                                                    style={{ width: '20px', height: '15px', objectFit: 'cover' }}
                                                />
                                            </div>
                                        )}
                                        <div className="language-name" style={{ 
                                            flex: 1, 
                                            fontSize: '14px',
                                        }}>
                                            <div style={{ fontWeight: '500' }}>{item[displayKey]}</div>
                                            {item?.fullName && item?.fullName !== item[displayKey] && (
                                                <div style={{ 
                                                    fontSize: '12px', 
                                                    color: '#666', 
                                                    marginTop: '2px' 
                                                }}>
                                                    {item?.fullName}
                                                </div>
                                            )}
                                        </div>
                                        {isItemSelected(item) && (
                                            <div className="check-icon">
                                                <RiCheckLine className='w-[16px] h-[16px]'  />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomSelect;