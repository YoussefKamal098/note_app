import React, {useRef} from "react";
import Loader from "../components/common/Loader";
import Pagination from "../components/pagination/Pagination";
import NotesList from "../components/notesList/NotesList";
import Navbar from "../components/navbar/Navbar";
import usePaginatedNotes from "../hooks/usePaginatedNotes";
import AppConfig from "../config/config";
import {useAuth} from "../contexts/AuthContext";
import useScrollToTop from "../hooks/useScrollToTop";
import usePersistedState from "../hooks/usePersistedState";

const HomePage = () => {
    const notesPerPage = AppConfig.NOTES_PER_PAGE;
    const {user} = useAuth();
    const [searchText, setSearchText] = usePersistedState("home_search_text", "");
    const replacedNoteIndexFromAdjacentPage = useRef(0);
    const pageSectionRef = useRef(null);

    const {
        notes,
        loading,
        totalPages,
        setTotalPages,
        setNotes,
        currentPage,
        setCurrentPage,
        fetchPageNotes,
        totalNotes
    } = usePaginatedNotes(
        user?.id,
        searchText,
        notesPerPage
    );

    const fetchReplacedNote = async () => {
        try {
            const notes = (totalPages > 1 && currentPage !== totalPages - 1)
                ? (await fetchPageNotes(currentPage + 1, searchText)).data
                : null;

            const note = notes && notes.length > replacedNoteIndexFromAdjacentPage.current
                ? notes[replacedNoteIndexFromAdjacentPage.current]
                : null;

            replacedNoteIndexFromAdjacentPage.current += 1;
            return note;
        } catch (error) {
            throw new Error(`Error fetching replaced note: ${error.message}`);
        }
    };

    const deleteNote = async (noteId, replacedNote) => {
        setNotes((prevNotes) =>
            replacedNote
                ? [...prevNotes.filter((note) => note.id !== noteId), replacedNote]
                : prevNotes.filter((note) => note.id !== noteId)
        );

        totalNotes.current -= 1;
        const newTotalPages = Math.ceil(totalNotes.current / notesPerPage);
        setCurrentPage((prevPage) =>
            prevPage > 0 && prevPage === totalPages - 1 && totalPages > newTotalPages ? prevPage - 1 : prevPage
        );
        setTotalPages(newTotalPages);
        replacedNoteIndexFromAdjacentPage.current -= 1;
    };

    const handleSearch = (text) => {
        setCurrentPage(0);
        setSearchText(text);
    };

    const handlePageClick = (data) => {
        if (!loading) setCurrentPage(data.selected);
    };

    useScrollToTop(pageSectionRef, [loading]);

    return (
        <div className="page" ref={pageSectionRef}>
            <Navbar
                showSearch={true}
                onSearch={handleSearch}
            />

            <div className="container">
                {loading ? <Loader/> : null}

                <NotesList
                    loading={loading}
                    notes={notes}
                    onDelete={deleteNote}
                    fetchReplacedNote={fetchReplacedNote}
                />
            </div>

            <Pagination
                totalPages={totalPages}
                onPageChange={handlePageClick}
                isDisabled={loading}
                currentPage={currentPage}
            />
        </div>
    );
};

export default HomePage;
