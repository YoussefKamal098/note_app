import React, { useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { toast } from 'react-toastify';
import noteValidationSchema from "../../validations/noteValidtion";

const EnterAnimation = css`
    ${keyframes`
        0% { transform: scale(1); }
        50% { transform: scale(0.9); }
        100% { transform: scale(1); }
    `}
`;

const TagInputStyled = styled.input`
    padding: 0.7em 1em;
    background: var(--color-background);
    border-radius: var(--border-radius);
    border: var(--border-width) solid var(--color-background);
    box-shadow: var(--box-shadow);
    color: var(--color-text);
    font-size: 1em;
    font-weight: 600;
    transition: 0.3s;

    ${({ animate }) => animate && css`
        animation: ${EnterAnimation} 0.3s ease-out;
    `}

    &::placeholder {
        color: var(--color-placeholder);
        font-size: 0.9em;
        font-weight: 500;
        transition: color 0.3s;
    }

    &:hover::placeholder,
    &:focus::placeholder{
        color: var(--color-accent);
    }

    &:hover,
    &:focus {
        border-color: var(--color-accent);
    }
`;

const TagsInput = ({ tags, setTags }) => {
    const [animate, setAnimate] = useState(false);

    const onTagChange = (e) => {
        if (e.key === 'Enter' && e.target.value.trim() !== '' && !animate) {
            setAnimate(true);
            setTimeout(() => setAnimate(false), 500);

            const newTag = e.target.value.trim().replaceAll(' ', '_');

            try {
                noteValidationSchema.tag.validateSync(newTag);
                noteValidationSchema.tags.validateSync([...tags, newTag]);
            } catch (error) {
                toast.error(error.message);
                return;
            }

            setTags((prevTags) => [...prevTags, newTag]);
            e.target.value = '';
        }
    };

    return (
        <TagInputStyled
            type="text"
            placeholder="🏷️ Add Tag for your note! 🌟📌"
            onKeyDown={onTagChange}
            animate={animate ? "true" : undefined}
        />
    );
};

export default TagsInput;