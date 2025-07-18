import {useCallback, useEffect, useRef, useMemo} from "react";

/**
 * Custom hook for managing request cancellation
 * @returns {Object} Contains methods for request management
 */
const useRequestManager = () => {
    const abortControllers = useRef(new Set());

    useEffect(() => {
        return () => {
            // Abort all ongoing requests on unmounting
            abortControllers.current.forEach(controller => controller.abort());
            abortControllers.current.clear();
        };
    }, []);

    /**
     * Creates a new abort controller and tracks it
     * @returns {AbortController} New abort controller
     */
    const createAbortController = useCallback(() => {
        const controller = new AbortController();
        abortControllers.current.add(controller);
        return controller;
    }, []);

    /**
     * Cleans up a completed request's abort controller
     * @param {AbortController} controller - Controller to remove
     */
    const removeAbortController = useCallback((controller) => {
        abortControllers.current.delete(controller);
    }, []);

    return useMemo(() => ({
        createAbortController,
        removeAbortController
    }), [createAbortController, removeAbortController]);
};

export default useRequestManager;
