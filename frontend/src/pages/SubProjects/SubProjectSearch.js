import Searchbar from "../Navbar/Searchbar";
import React from "react";
import { withStyles } from "@material-ui/core";
import strings from "../../localizeStrings";

const styles = {
  searchField: {
    padding: "2px",
    margin: "5px",
    width: "270px",
    display: "flex",
    flexDirection: "row",
    opacity: "0.8",
    boxShadow: "none"
  },
  debounceInput: {}
};

const SubProjectSearch = ({
  searchBarDisplayed,
  searchDisabled,
  searchTerm,
  storeSearchBarDisplayed,
  storeSearchTerm
}) => {
  return (
    <Searchbar
      datatest="subproject-search"
      searchBarDisplayed={searchBarDisplayed}
      searchTerm={searchTerm}
      searchDisabled={searchDisabled}
      storeSearchBarDisplayed={storeSearchBarDisplayed}
      storeSearchTerm={storeSearchTerm}
      autoSearch={true}
      previewText={strings.common.subproject_searchtext}
    />
  );
};

export default withStyles(styles)(SubProjectSearch);
