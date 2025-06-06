import {Link} from "react-router-dom";
import styled from "styled-components";

const NotesListContainerStyled = styled.div`
    display: flex;
    font-size: 0.9em;
    flex-direction: column;
    border-top: var(--border-width) solid var(--color-border);
    transition: 0.3s ease;

    ${({loading}) => loading && `
        opacity: 0.5;
        pointer-events: none; 
        cursor: not-allowed;
    `}
`;

const ItemContainerStyled = styled.div`
    position: relative;
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    background-color: ${({index}) => index % 2 === 0 ? "var(--color-background)" : "var(--color-background-primary)"};
    padding: 1em 1em 0.5em 1em;
    transition: 0.3s ease;
    overflow: hidden;
    gap: 1em;

    .left {
        flex-direction: column;
        justify-content: space-between;
        max-width: 50%;
    }

    .right {
        display: flex;
        align-items: center;
        gap: 1em;
        max-width: 50%;
    }

    .controllers {
        display: flex;
        align-items: center;
        gap: 0.5em;
    }

    /* Media query for screens with width less than 600px */
    @media (max-width: 600px) {
        flex-direction: column;

        .left, .right {
            max-width: 100%;
        }

        .right {
            align-self: flex-end;
        }

        .controllers {
            flex-wrap: wrap;
        }
    }

    ${({loading}) => loading && `
        pointer-events: none; 
        cursor: not-allowed;
    `}
`;

const TitleStyled = styled.div`
    display: block;
    overflow: hidden;
    text-wrap: nowrap;
    text-overflow: ellipsis;
`;

const TitleLinkStyled = styled(Link)`
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.5em;
    font-size: 0.95em;
    font-weight: 600;
    color: var(--color-secondary);
    margin-bottom: 0.5em;
    cursor: pointer;
    transition: 0.3s ease;

    .icon {
        min-width: max-content;
        font-size: 1.2em;
        scale: 0;
        opacity: 0;
        transition: 0.3s;
    }

    &:hover .icon {
        scale: 1;
        opacity: 1;
    }

    &:hover {
        color: var(--color-accent);
    }
`

const TagsContainerStyled = styled.div`
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 0.5em;
`;

const TagStyled = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    align-self: flex-start;
    gap: 0.25em;
    font-size: 0.8em;
    font-weight: 600;
    color: var(--color-placeholder);
    padding: 0.2em 0.6em;
    border-radius: calc(var(--border-radius) * 2);
    background-color: var(--color-background-secondary);

    span {
        color: var(--color-accent);
        font-size: 1.25em;
        font-weight: bold;
    }
`;

const CreatedAt = styled.span`
    font-size: 0.725em;
    font-weight: 600;
    color: var(--color-placeholder);
`;

export {
    NotesListContainerStyled,
    ItemContainerStyled,
    TitleStyled,
    TitleLinkStyled,
    TagsContainerStyled,
    TagStyled,
    CreatedAt
};
