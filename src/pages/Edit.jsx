import styles from "./Edit.module.css";
import { useEffect, useState } from "react";
import { useSkillTreesContext } from "../contexts/SkillTreesContext";
import ModuleModal from "../components/edit/ModuleModal";
import { useNavigate, useParams } from "react-router-dom";
import EditPageChart from "../components/edit/EditPageChart";
import MainButton from "../components/MainButton";
import Loader from "../components/Loader";

function Edit() {
  const { displayedTree, mergeTree, getNodesById, isLoading, error } =
    useSkillTreesContext();

  const navigate = useNavigate();
  const { nodeIds } = useParams(); // string of node IDs separated by &

  const [currentTree, setCurrentTree] = useState(displayedTree);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [currentNode, setCurrentNode] = useState(null);
  const [isModuleModalVisible, setIsModuleModalVisible] = useState(false);

  useEffect(function initializeEditPagePart1() {
    getNodesById(nodeIds);
  }, []);

  useEffect(
    function initializeEditPagePart2() {
      setCurrentTree(displayedTree);
    },
    [displayedTree]
  );

  console.log(displayedTree);
  console.log(currentTree);
  async function handleSubmit() {
    // validation?
    // merge currentTree to database tree if validation passes
    await mergeTree(currentTree);
    //go back to Home page
    navigate("/");
  }

  return (
    <>
      <div
        className={styles.mainDiv}
        style={
          isModuleModalVisible ? { display: "none" } : { display: "block" }
        }
      >
        <div
          className={styles.nodeDescription}
          style={{ display: currentNode ? "block" : "none" }}
        >
          <div>
            <h3>{currentNode?.title}</h3>
          </div>
          <p>{currentNode?.description}</p>
        </div>
        {isLoading && <Loader />}
        {error && <h1>{error}</h1>}
        {!isLoading && !error && currentTree && (
          <EditPageChart
            currentTree={currentTree}
            selectedNodes={selectedNodes}
            setSelectedNodes={setSelectedNodes}
            setCurrentNode={setCurrentNode}
          />
        )}
        <div className={styles.buttonDiv}>
          {selectedNodes.length > 0 ? (
            <button
              className={styles.plusButton}
              onClick={setIsModuleModalVisible}
            >
              +
            </button>
          ) : null}
        </div>

        <div className={styles.submitDiv}>
          <MainButton onClick={handleSubmit}>Submit</MainButton>
        </div>
      </div>
      {isModuleModalVisible && (
        <ModuleModal
          prerequisiteNodes={selectedNodes}
          setCurrentTree={setCurrentTree}
          setIsModuleModalVisible={setIsModuleModalVisible}
        />
      )}
    </>
  );
}

export default Edit;
