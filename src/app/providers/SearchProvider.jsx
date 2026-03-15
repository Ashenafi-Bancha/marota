/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from "react";

const SearchContext = createContext(null);

export const SearchProvider = ({ children }) => {
	const [searchQuery, setSearchQuery] = useState("");

	const value = useMemo(
		() => ({ searchQuery, setSearchQuery }),
		[searchQuery]
	);

	return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
};

export const useSearch = () => {
	const context = useContext(SearchContext);
	if (!context) {
		throw new Error("useSearch must be used within a SearchProvider");
	}
	return context;
};
