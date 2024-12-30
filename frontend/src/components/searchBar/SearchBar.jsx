import React, { useState, useMemo, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { debounce } from "lodash";
import { WidthTransitionContainer } from "../animations/ContainerAnimation";
import {
    SearchBarWrapperStyled,
    SearchBarContainerStyled,
    InputStyled,
    IconWrapperStyled,
} from "./SearchBarStyles";

const SearchBar = ({ onSearch = (value) => value }) => {
    const storedSearchText = localStorage.getItem("searchText") || "";
    const [searchText, setSearchText] = useState(storedSearchText);
    const [value, setValue] = useState(storedSearchText);

    useEffect(() => {
        setSearchText(value.trim());
        localStorage.setItem("searchText", value);
    }, [value]);

    const debouncedSearch = useMemo(
        () =>
            debounce((value) => {
                if (onSearch) onSearch(value);
            }, 500),
        [onSearch]
    );

    const handleChange = (e) => {
        const value = e.target.value;
        setValue(value);
    };

    const handleKeyUp = () => {
        if (setSearchText) {
            debouncedSearch(searchText);
        }
    };

    const handleClear = () => {
        setValue("");
        if (onSearch) onSearch("");
    };

    return (
        <SearchBarWrapperStyled>
            <WidthTransitionContainer keyProp={"SearchBar"}>
                <SearchBarContainerStyled>
                    <InputStyled
                        type="search"
                        placeholder="Search..."
                        value={value}
                        onChange={handleChange}
                        onKeyUp={handleKeyUp}
                    />
                    <IconWrapperStyled>
                        {value && (
                            <IoClose className="close-icon" onClick={handleClear} />
                        )}
                        <FaSearch className="search-icon" />
                    </IconWrapperStyled>
                </SearchBarContainerStyled>
            </WidthTransitionContainer>
        </SearchBarWrapperStyled>
    );
};

export default SearchBar;