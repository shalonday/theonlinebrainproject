/* 
Copyright 2023, Salvador Pio Alonday

This file is part of The Online Brain Project

The Online Brain Project is free software: you can redistribute it and/or modify it under
the terms of the GNU General Public License as published by the Free Software Foundation,
either version 3 of the License, or (at your option) any later version.

The Online Brain Project is distributed in the hope that it will be useful, but WITHOUT
ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with The Online
Brain Project. If not, see <https://www.gnu.org/licenses/>.
*/

import styles from "./Search.module.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import SearchPageChart from "../components/search/SearchPageChart";
import MainButton from "../components/MainButton";
import Loader from "../components/Loader";
import { fetchUniversalTree } from "../services/apiTrees";
import { useQuery } from "@tanstack/react-query";
import NodeDescription from "../components/NodeDescription";
import SelectedNodesCard from "../components/search/SelectedNodesCard";
import toast from "react-hot-toast";

function Search() {
  const {
    isLoading,
    data: universalTree,
    error,
  } = useQuery({
    queryKey: ["universalTree"],
    queryFn: fetchUniversalTree,
  });

  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");

  const [selectedNodes, setSelectedNodes] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      //search only locally. then setSelectedNodes to the search results;
      const results = searchNodes(searchQuery, universalTree);
      if (results.length > 0) {
        setCurrentNode(null); //doesn't make sense to retain previous currentNode when searching
        setSelectedNodes(results);
      } else {
        toast.error("That didn't return any results!");
      }
    }
  }

  function handleGeneratePath() {
    navigate(`/s/0/e/${currentNode.id}`);
  }

  return (
    <div className={styles.searchPage}>
      {currentNode && <NodeDescription currentNode={currentNode} />}

      {isLoading && <Loader />}
      {error && <h1>{error}</h1>}
      {!isLoading && !error && (
        <SearchPageChart
          universalTree={universalTree}
          selectedNodes={selectedNodes}
          setSelectedNodes={setSelectedNodes}
          setCurrentNode={setCurrentNode}
          currentNode={currentNode}
        />
      )}
      <div className={styles.bottomThird}>
        {selectedNodes.length > 0 && (
          <SelectedNodesCard
            selectedNodes={selectedNodes}
            setCurrentNode={setCurrentNode}
          />
        )}
        <div className={styles.buttonsDiv}>
          <MainButton onClick={handleGeneratePath} disabled={!currentNode}>
            Generate Path
          </MainButton>
        </div>

        <div className={styles.inputDiv}>
          <input
            placeholder="What do you want to learn?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`${styles.input} ${
              searchQuery ? styles.inputNoBackground : ""
            }`}
          />
        </div>
      </div>
    </div>
  );
}

// String, Tree -> Nodes
function searchNodes(query, tree) {
  const queryResults = tree.nodes.filter((node) => nodeIsMatch(node, query));
  return queryResults;
}

// Node, String -> Boolean
function nodeIsMatch(node, query) {
  if (node.type === "skill") {
    return (
      node.title?.toLowerCase().includes(query.toLowerCase()) ||
      node.description?.toLowerCase().includes(query.toLowerCase())
    );
  } else return false;
}

export default Search;
