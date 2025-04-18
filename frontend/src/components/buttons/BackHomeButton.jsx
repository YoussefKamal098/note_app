import React from "react";
import styled from 'styled-components';
import {useNavigate} from "react-router-dom";
import {IoMdArrowRoundBack} from "react-icons/io";
import RoutesPaths from "../../constants/RoutesPaths";
import Tooltip from "../tooltip/Tooltip";

const BackHomeStyled = styled.div`
    font-size: 1.2em;
    color: var(--color-accent);
    transition: transform 0.3s, color 0.3s;
    cursor: pointer;

    &:hover {
        color: var(--color-accent);
        transform: scale(1.2);
    }

    &:active {
        transform: scale(0.9);
    }
`

const BackHomeButton = () => {
    const navigate = useNavigate();

    return (
        <Tooltip title={"Back to home page"}>
            <BackHomeStyled>
                <IoMdArrowRoundBack onClick={() => navigate(RoutesPaths.HOME)}> </IoMdArrowRoundBack>
            </BackHomeStyled>
        </Tooltip>

    )
}

export default BackHomeButton;
