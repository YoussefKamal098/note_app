import React from 'react';
import styled from 'styled-components';
import { RiPushpin2Fill, RiUnpinLine } from 'react-icons/ri';

const PinButtonStyled = styled.button`
    font-size: 1.2em;
    color: ${({ ispinned }) => (ispinned ? "var(--color-accent)" : "var(--color-placeholder)")};
    transition: transform 0.3s, color 0.3s;
    cursor: pointer;

    &:hover {
        color: var(--color-accent);
        transform: scale(1.2);
    }

    &:active {
        transform: scale(0.9);
    }
`;

const PinButton = ({ isPinned, togglePin }) => {
    return (
        <PinButtonStyled onClick={togglePin} ispinned={isPinned ? "true" : undefined}>
            {isPinned ? <RiPushpin2Fill /> : <RiUnpinLine />}
        </PinButtonStyled>
    );
};

export default PinButton;