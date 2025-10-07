/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from 'react';
import { RiCheckLine, RiCloseLine } from 'react-icons/ri';
import { AngleUp } from '../../../icons/icons';

const CustomMultiSelect = ({ 
    data = [],
    prevData = [],
    selectedItems = [],
    onSelectionChange,
    placeholder = "Select items...",
    searchPlaceholder = "Search...",
    showSelectedTags = true,
    multiSelect = true,
    displayKey = "name", // key to display in options
    searchKey = "name", // key to search by
    iconKey = "flag", // key for icon/image
    showIcon = true,
    icon = "",
    maxHeight = "200px",
    disabled = false,
    className = "",
    loading = false,
    emptyMessage = "No items found"
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const dropdownRef = useRef(null);

    // Convert selectedItems to full objects if they're just strings/names
    const selectedObjects = selectedItems.map(item => {
        if (typeof item === 'string') {
            // If selectedItems contains just names, find the full object from data
            const foundItem = data?.find(dataItem => dataItem[displayKey] === item);
            if (foundItem) {
                return foundItem;
            }
            // If not found in current data, create a basic object
            return { [displayKey]: item };
        }
        return item;
    }).filter(Boolean); // Remove any null/undefined items


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

    // Filter data based on search query
    const filteredData = searchQuery
        ? data.filter(item =>
            item[searchKey]?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : data;

    // Handle item selection
    const toggleItem = (item) => {
        if (disabled) return;

        let newSelection;
        if (multiSelect) {
            const isSelected = selectedObjects.some(selected => 
                selected[displayKey] === item[displayKey]
            );
            
            if (isSelected) {
                newSelection = selectedObjects.filter(selected => 
                    selected[displayKey] !== item[displayKey]
                );
            } else {
                newSelection = [...selectedObjects, item];
            }
        } else {
            // Single select
            newSelection = selectedObjects.some(selected => 
                selected[displayKey] === item[displayKey]
            ) ? [] : [item];
            setIsOpen(false);
        }
        
        // Extract just the names/displayKey values to send to parent
        const newSelectionNames = newSelection.map(selectedItem => selectedItem[displayKey]);
        onSelectionChange?.(newSelectionNames);
    };

    // Remove selected item
    const removeItem = (item) => {
        if (disabled) return;
        
        const newSelection = selectedObjects.filter(selected => 
            selected[displayKey] !== item[displayKey]
        );
        
        // Extract just the names/displayKey values to send to parent
        const newSelectionNames = newSelection.map(selectedItem => selectedItem[displayKey]);
        onSelectionChange?.(newSelectionNames);
    };

    // Check if item is selected
    const isItemSelected = (item) => {
        return selectedObjects.some(selected => 
            selected[displayKey] === item[displayKey]
        );
    };

    // Get header display text
    const getHeaderText = () => {
        if (selectedObjects.length === 0) {
            return placeholder;
        }
        
        if (!multiSelect) {
            return selectedObjects[0][displayKey];
        }
        
        // For multiSelect, show count or first few items
        if (selectedObjects.length === 1) {
            return selectedObjects[0][displayKey];
        } else {
            return `${selectedObjects.length} Languages selected`;
        }
    };

    return (
        <div className={`language-selection-container ${className}`}>
            <div className="language-dropdown-container" ref={dropdownRef}>
                <div
                    className={`language-dropdown-header ${disabled ? 'disabled' : ''} ${selectedObjects.length > 0 ? 'has-selection' : ''}`}
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                >
                    <div className='language-dropdown-inner'>
                        {showIcon && (
                            <div className="globe-icon">
                                {icon}
                            </div>
                        )}
                        <div className="header-text">
                            {getHeaderText()}
                        </div>
                        <div className="dropdown-arrow">
                            <img 
                                src={AngleUp} 
                                alt='' 
                                className={`w-[10px] h-[10px] transition-transform ${isOpen ? 'rotate-180' : ''}`} 
                            />
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
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <div className="language-options" style={{ overflowY: 'auto', maxHeight: 'calc(100% - 60px)' }}>
                            {loading ? (
                                <div className="loading-message">Loading...</div>
                            ) : !data || data.length === 0 ? (
                                <div className="empty-message">No data available</div>
                            ) : filteredData.length === 0 ? (
                                <div className="empty-message">{emptyMessage}</div>
                            ) : (
                                filteredData.map((item, index) => (
                                    <div
                                        key={`${item[displayKey]}-${index}`}
                                        className={`language-option ${isItemSelected(item) ? 'selected' : ''}`}
                                        onClick={() => toggleItem(item)}
                                    >
                                        {showIcon && item[iconKey] && (
                                            <div className="flag-icon">
                                                <img src={item[iconKey]} alt={item[displayKey]} />
                                            </div>
                                        )}
                                        <div className="language-name">{item[displayKey]}</div>
                                        {isItemSelected(item) && (
                                            <div className="check-icon">
                                                <RiCheckLine className='w-[13px]' />
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Selected Tags - Always show if there are selected items and showSelectedTags is true */}
            {showSelectedTags && multiSelect && selectedObjects.length > 0 && (
                <div className="selected-languages">
                    {selectedObjects.map((item, index) => (
                        <div key={`selected-${item[displayKey]}-${index}`} className="selected-language-tag">
                            {showIcon && item[iconKey] && (
                                <div className="flag-icon">
                                    <img src={item[iconKey]} alt={item[displayKey]} />
                                </div>
                            )}
                            <div className="language-name">{item[displayKey]}</div>
                            {!disabled && (
                                <div
                                    className="remove-icon"
                                    onClick={() => removeItem(item)}
                                >
                                    <RiCloseLine className='w-[16px]' style={{ color: '#99A0AE' }} />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomMultiSelect;