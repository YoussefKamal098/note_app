import React from "react";
import styled from "styled-components";
import {GiPencilRuler} from "react-icons/gi";
import {FadeInAnimation} from "../animations/ContainerAnimation";

const NoNotesStyled = styled.div`
    display: flex;
    font-size: 1.5em;
    font-weight: bold;
    text-align: center;
    color: var(--color-placeholder);
    flex-direction: column;
    gap: 0.5em;
    justify-content: center;
    align-items: center;
`;

const NoNotes = ({children}) => {
    return (
        <FadeInAnimation keyProp="no-notes">
            <NoNotesStyled>
                <GiPencilRuler size={100}/>
                {children}
            </NoNotesStyled>
        </FadeInAnimation>
    );
};

export default NoNotes;
