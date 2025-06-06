import React, {useState} from "react";
import {useParams} from "react-router-dom";
import Navbar from "../components/navbar/Navbar";
import Note from "../components/note/Note";
import Loader from "../components/common/Loader";
import useNoteData from "../hooks/useNoteData";
import useNoteActions from "../hooks/useNoteActions";
import {useAuth} from "../contexts/AuthContext";

const NotePage = () => {
    const {id} = useParams();
    const {user} = useAuth();
    const [loading, setLoading] = useState(true);

    // Fetch note data
    const {note, setNote, unsavedChanges} = useNoteData(user?.id, id, setLoading);
    // Actions
    const {handleSave, handleDelete} = useNoteActions(note, setNote, setLoading);

    return (
        <div className="page">
            <Navbar showSearch={false}/>
            <div className="wrapper">
                {loading ? <Loader/> : null}

                {note && (
                    <Note
                        origNote={note}
                        unsavedChanges={unsavedChanges}
                        onSave={handleSave}
                        onDelete={handleDelete}
                    />
                )
                }
            </div>
        </div>
    );
};

export default NotePage;
