import React from "react";
import styled from "styled-components";
import { CiCalendarDate } from "react-icons/ci"
import { formatDate } from "../../utils";

const DateInfo = styled.div`
    font-size: 0.8em;
    font-weight: 500;
    color: var(--color-text);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 0.5em;
    padding: 0.75em 1em;
    margin: 1em 0;

    div {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 5px;
    }

    div span {
        font-weight: 600;
        color: var(--color-text);
    }

    svg {
        font-size: 1.5em;
        transition: transform 0.3s ease;
    }
`;

function NoteDate({createdAt=null, updatedAt=null }) {

    return (
        <DateInfo>
            <div>
                <span> Created: </span>
                <span>{formatDate(createdAt)}</span>
                <CiCalendarDate />
            </div>
            <div>
                <span> Updated: </span>
                <span>{formatDate(updatedAt)}</span>
                <CiCalendarDate />
            </div>
        </DateInfo>
    )
}

export default NoteDate;