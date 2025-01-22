import React, {useCallback, useEffect, useState} from 'react';
import styled from 'styled-components';
import 'react-toastify/dist/ReactToastify.css';
import {MdDeleteForever, MdSave} from "react-icons/md";
import NoteMarkdownTabs from "./NoteMarkdownTabs";
import PinButton from "../buttons/PinButton";
import EditableTags from "../tags/EditableTags";
import NoteTitleInputField from "./NoteTitleInputField";
import NoteDate from "./NoteDate";
import Button, {BUTTON_TYPE, ButtonsContainerStyled} from "../buttons/Button";
import BackHomeButton from "../buttons/BackHomeButton";
import {useToastNotification} from "../../contexts/ToastNotificationsContext";
import {useConfirmation} from "../../contexts/ConfirmationContext";
import {POPUP_TYPE} from "../confirmationPopup/ConfirmationPopup";
import noteValidationSchema from "../../validations/noteValidtion";
import cacheService from "../../services/cacheService"
import {deepEqual} from "shared-utils/obj.utils";

const NoteContainerStyled = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 1em;
    max-width: 55em;
    margin: 1em auto;
    background-color: var(--color-background);
    padding: 1em 1.25em 2em;
    border-radius: var(--border-radius);
    overflow: hidden;
`;

const HeaderContainerStyled = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1em;
    margin-bottom: 2em;
`

const Note = React.memo(function Note({
                                          id = "",
                                          origCreateAt = null,
                                          origUpdatedAt = null,
                                          origTitle = 'Untitled',
                                          origContent = '# Untitled',
                                          origIsPinned = false,
                                          origTags = ["InspireYourself"],
                                          onSave = (noteData) => (noteData),
                                          onDelete = () => ({}),
                                          unSavedChanges = {}
                                      }) {
    const {notify} = useToastNotification();
    const [content, setContent] = useState(origContent || '');
    const [tags, setTags] = useState(origTags || []);
    const [title, setTitle] = useState(origTitle || '');
    const [isPinned, setIsPinned] = useState(origIsPinned || false);
    const [hasChanges, setHasChanges] = useState(false);
    const {showConfirmation} = useConfirmation();

    useEffect(() => {
        if (id) setUnSavedChanges();
    }, [id, origTitle, origContent, origTags, origIsPinned]);


    useEffect(() => {
        if (hasChanges && id) saveUnsavedChanges();
    }, [hasChanges, id, title, content, tags, isPinned]);

    const checkChanges = useCallback(() => {
        return origTitle !== title ||
            !deepEqual(origTags, tags) ||
            origContent !== content ||
            isPinned !== origIsPinned;
    }, [title, content, tags, isPinned]);


    useEffect(() => {
        setHasChanges(checkChanges());
    }, [checkChanges]);

    useEffect(() => {
        setHasChanges(checkChanges());
    }, [title, content, tags, isPinned, checkChanges]);


    const setUnSavedChanges = async () => {
        if (unSavedChanges) {
            setTitle(unSavedChanges.title !== undefined ? unSavedChanges.title : title);
            setContent(unSavedChanges.content !== undefined ? unSavedChanges.content : content);
            setTags(unSavedChanges.tags !== undefined ? unSavedChanges.tags : tags);
            setIsPinned(unSavedChanges.isPinned !== undefined ? unSavedChanges.isPinned : isPinned);
        }
    };

    const saveUnsavedChanges = async () => {
        try {
            await cacheService.save(id, {title, content, tags, isPinned});
        } catch (error) {
            notify.error(`Failed to save unsaved changes: ${error.message}.`);
        }
    };

    const onNoteSave = useCallback(() => {
        try {
            noteValidationSchema.title.validateSync(title);
            noteValidationSchema.tags.validateSync(tags);
            noteValidationSchema.content.validateSync(content);
        } catch (error) {
            notify.warn(error.message);
            return;
        }

        onSave({
            id,
            content: content,
            title,
            isPinned,
            tags
        });
    }, [content, tags, title, isPinned]);

    const onNoteDelete = () => {
        showConfirmation({
            type: POPUP_TYPE.DANGER,
            confirmationMessage: "Are you sure you want to delete this note?",
            onConfirm: () => onDelete(),
        });
    }

    return (
        <NoteContainerStyled>
            <HeaderContainerStyled>
                <BackHomeButton/>
                <PinButton isPinned={isPinned} togglePin={() => setIsPinned(!isPinned)}/>
            </HeaderContainerStyled>

            <NoteTitleInputField title={title} setTitle={setTitle}/>

            {id && id !== "new" && <NoteDate createdAt={origCreateAt} updatedAt={origUpdatedAt}/>}

            <EditableTags tags={tags} setTags={setTags}/>

            <ButtonsContainerStyled>
                <Button type={BUTTON_TYPE.DANGER}
                        disabled={(!id || id === "new")}
                        icon={MdDeleteForever}
                        onClick={onNoteDelete}>Delete</Button>
                <Button type={BUTTON_TYPE.SUCCESS}
                        disabled={!hasChanges}
                        icon={MdSave}
                        onClick={onNoteSave}> Save </Button>
            </ButtonsContainerStyled>

            <NoteMarkdownTabs content={content} onContentChange={setContent}/>
        </NoteContainerStyled>
    );
});

export default Note;
