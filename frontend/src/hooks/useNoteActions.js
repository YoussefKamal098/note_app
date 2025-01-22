import {useNavigate} from "react-router-dom";
import RoutesPaths from "../constants/RoutesPaths";
import {useToastNotification} from "../contexts/ToastNotificationsContext";
import noteService from "../api/noteService";
import CacheService from "../services/cacheService";
import {formatBytes, stringSizeInBytes} from "shared-utils/string.utils";

const useNoteActions = (note = {}, setNote = (prev) => (prev), setLoading = (prev) => (!prev)) => {
    const {notify} = useToastNotification();
    const navigate = useNavigate();

    const createNote = async ({id, isPinned, tags, title, content}) => {
        if (!id) return;

        try {
            const {data: note} = await noteService.create({isPinned, tags, title, content});
            notify.success(`New note created with ID: ${note.id}`);
            navigate(RoutesPaths.NOTE(note.id), {replace: true});
            return note;
        } catch (error) {
            throw new Error(`Failed to create note: ${error.message}`);
        }
    };

    const saveNoteUpdates = async ({id, isPinned, tags, title, content}) => {
        if (!id) return;

        try {
            const {data: note} = await noteService.updateAuthenticatedUserNoteById(id, {
                isPinned,
                tags,
                title,
                content
            });
            notify.success(`Content saved! ${formatBytes(stringSizeInBytes(content))}.`);
            return note;
        } catch (error) {
            throw new Error(`Failed to update note: ${error.message}`);
        }
    };

    const handleSave = async ({id, isPinned, tags, title, content}) => {
        setLoading(true);
        let savedNote = null;

        try {
            savedNote = note.id === "new" ?
                savedNote = await createNote({id, isPinned, tags, title, content}) :
                savedNote = await saveNoteUpdates({id, isPinned, tags, title, content});

            await CacheService.delete(id);

            setNote(savedNote);
        } catch (error) {
            notify.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!note.id) return;
        setLoading(true);

        try {
            await noteService.deleteAuthenticatedUserNoteById(note.id);
            await CacheService.delete(note.id);
            notify.success("Note deleted successfully!");
            navigate(RoutesPaths.HOME);
        } catch (error) {
            setLoading(false);
            notify.error(`Failed to delete note: ${error.message}`);
        }
    };

    return {handleSave, handleDelete};
};

export default useNoteActions;