import React from "react";
import styled from "styled-components";
import PropTypes from "prop-types";
import LoadingEffect from "../common/LoadingEffect";

const BUTTON_TYPE = Object.freeze({
    SUCCESS: "success",
    INFO: "info",
    SECONDARY: "secondary",
    DANGER: "danger",
});

const BUTTON_PROPS = Object.freeze({
    [BUTTON_TYPE.SUCCESS]: {
        color: "var(--color-accent)"
    },
    [BUTTON_TYPE.INFO]: {
        color: "var(--color-primary)"
    },
    [BUTTON_TYPE.SECONDARY]: {
        color: "var(--background-quaternary)"
    },
    [BUTTON_TYPE.DANGER]: {
        color: "var(--color-danger)"
    }
});

const ButtonStyled = styled.button`
    color: var(--color-background-light);
    min-width: 5em;
    min-height: 2.5em;
    font-size: 0.9em;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4em;
    padding: 8px;
    border-radius: 8px;
    opacity: ${(props) => props.disabled ? 0.5 : 1};
    cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
    background-color: ${(props) => BUTTON_PROPS[props.button_type].color};
    box-shadow: var(--box-shadow-hoverable);
    transition: 0.3s ease;

    &:hover {
        scale: 1.1;
    }

    &:active {
        scale: 0.85
    }
`;

const ButtonsContainerStyles = styled.div`
    display: flex;
    justify-content: flex-end;
    align-items: center;
    flex-wrap: nowrap;
    gap: 0.5em;
`;

const Button = ({
                    type = BUTTON_TYPE.SUCCESS,
                    buttonType = "button",
                    disabled = false,
                    onClick = () => ({}),
                    Icon = null,
                    children = "",
                    loading = false,
                    style
                }) => {
    return (
        <ButtonStyled button_type={type} style={style} type={buttonType} disabled={disabled || loading}
                      onClick={onClick}>
            {Icon && <Icon/>}
            {children} <LoadingEffect loading={loading}/>
        </ButtonStyled>
    );
};

Button.propTypes = {
    type: PropTypes.oneOf(Object.values(BUTTON_TYPE)),
    disabled: PropTypes.bool,
    onClick: PropTypes.func,
    children: PropTypes.node,
    icon: PropTypes.elementType,
};

export {BUTTON_TYPE, ButtonsContainerStyles};
export default Button;
