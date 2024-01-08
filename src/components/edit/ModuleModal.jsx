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

import "@mdxeditor/editor/style.css";
import { Suspense, useState } from "react";
import styles from "./ModuleModal.module.css";
import AddNodeSection from "./module-modal/AddNodeSection";
import MainTextSection from "./module-modal/MainTextSection";
import { getObjectiveNodes, getPrerequisiteNodes, uuidv4 } from "../../utils";
import Loader from "../Loader";

function ModuleModal({
  moduleToUpdate = null,
  currentTree,
  setCurrentTree,
  setIsModuleModalVisible,
}) {
  console.log(moduleToUpdate);

  const presetPrereqNodes = moduleToUpdate
    ? getPrerequisiteNodes(moduleToUpdate, currentTree)
    : null;
  const presetObjNodes = moduleToUpdate
    ? getObjectiveNodes(moduleToUpdate, currentTree)
    : null;

  const [title, setTitle] = useState(
    moduleToUpdate ? moduleToUpdate.title : ""
  );
  const [objectiveNodes, setObjectiveNodes] = useState(
    moduleToUpdate ? presetObjNodes : []
  );
  const [prerequisiteNodes, setPrerequisiteNodes] = useState(
    moduleToUpdate ? presetPrereqNodes : []
  );
  const [learnText, setLearnText] = useState(
    moduleToUpdate ? moduleToUpdate.learnText : ""
  );
  const [practiceText, setPracticeText] = useState(
    moduleToUpdate ? moduleToUpdate.practiceText : ""
  );

  // Array of links added onto Learn and Practice sections.
  const [resourcesArray, setResourcesArray] = useState(
    moduleToUpdate ? moduleToUpdate.resourcesArray : []
  );

  // Add module, skill nodes (prereq and objective), and links to currentTree

  function handleSubmit(e) {
    e.preventDefault();

    const newPrereqNodes = prerequisiteNodes.filter(
      (node) =>
        !currentTree.nodes
          .map((existingNode) => existingNode.id)
          .includes(node.id)
    );

    const newTargetNodes = objectiveNodes.filter(
      (node) =>
        !currentTree.nodes
          .map((existingNode) => existingNode.id)
          .includes(node.id)
    );

    if (moduleToUpdate) {
      //updating an existing module

      const moduleId = moduleToUpdate.id;
      const updatedModule = {
        ...moduleToUpdate,
        title: title,
        learnText: learnText,
        practiceText: practiceText,
        resourcesArray: resourcesArray,
      };

      // add links for each node in prerequisiteNodes that doesn't have an isPrerequisiteTo link to this module
      const newIsPrerequisiteToLinks = prerequisiteNodes
        .filter(
          (prereqNode) =>
            !isNodeLinkedAsPrereqToModule(
              prereqNode,
              moduleToUpdate,
              currentTree
            )
        )
        .map((prereqNode) => {
          const newLink = {
            id: uuidv4(),
            source: prereqNode.id,
            target: moduleId,
          };
          return newLink;
        });

      const newTeachesLinks = objectiveNodes
        .filter(
          (objNode) =>
            !isNodeLinkedAsObjToModule(objNode, moduleToUpdate, currentTree)
        )
        .map((targetNode) => {
          const newLink = {
            id: uuidv4(),
            source: moduleId,
            target: targetNode.id,
          };
          return newLink;
        });

      const newLinks = newIsPrerequisiteToLinks.concat(newTeachesLinks);
      const newNodes = newTargetNodes.concat(newPrereqNodes);

      const removedPrereqNodes = presetPrereqNodes.filter(
        (presetNode) =>
          !prerequisiteNodes.map((node) => node.id).includes(presetNode.id)
      );

      const removedObjNodes = presetObjNodes.filter(
        (presetNode) =>
          !objectiveNodes.map((node) => node.id).includes(presetNode.id)
      );

      // links connected to prereqNodes that were removed. We can delete links because they don't contain data,
      // but nodes should be deleted in another way.
      const isPrerequisiteToLinksToDelete = currentTree.links.filter(
        (link) =>
          removedPrereqNodes.map((node) => node.id).includes(link.source) &&
          link.target === moduleId
      );

      // links connected to objNodes that were removed
      const teachesLinksToDelete = currentTree.links.filter(
        (link) =>
          removedObjNodes.map((node) => node.id).includes(link.target) &&
          link.source === moduleId
      );

      const linksToDelete =
        isPrerequisiteToLinksToDelete.concat(teachesLinksToDelete);

      setCurrentTree((tree) => {
        const newTree = {
          nodes: tree.nodes
            .map((node) => (node.id === moduleId ? updatedModule : node)) // add this updated module
            .concat(newNodes),
          links: tree.links
            .filter((link) => !linksToDelete.map((i) => i.id).includes(link.id))
            .concat(newLinks),
        };

        //test:
        // adding new nodes (and links)
        // removing links

        return newTree;
      });
    } else {
      //creating a new module !!!
      const moduleId = uuidv4();

      const newModule = {
        id: moduleId,
        type: "module",
        title: title ? title : "untitled",
        learnText: learnText,
        practiceText: practiceText,
        resourcesArray: resourcesArray,
      };

      const newIsPrerequisiteToLinks = prerequisiteNodes.map((prereqNode) => {
        const newLink = {
          id: uuidv4(),
          source: prereqNode.id,
          target: moduleId,
        };
        return newLink;
      });

      const newTeachesLinks = objectiveNodes.map((targetNode) => {
        const newLink = {
          id: uuidv4(),
          source: moduleId,
          target: targetNode.id,
        };
        return newLink;
      });
      const newLinks = newIsPrerequisiteToLinks.concat(newTeachesLinks);
      const newNodes = objectiveNodes
        .concat(newPrereqNodes)
        .concat([newModule]);

      setCurrentTree((tree) => {
        const newTree = {
          nodes: tree.nodes.concat(newNodes),
          links: tree.links.concat(newLinks),
        };
        return newTree;
      });
    }

    // close the modal
    setIsModuleModalVisible(false);
  }

  function handleExit(e) {
    e.preventDefault();
    setIsModuleModalVisible(false);
  }

  return (
    <Suspense fallback={<Loader />}>
      <form className={styles.form}>
        <div className={styles.exitDiv}>
          <button onClick={handleExit} style={{ cursor: "pointer" }}>
            &larr;
          </button>
        </div>
        <fieldset className={styles.title}>
          <h3>
            <input
              placeholder="[optional title]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </h3>
        </fieldset>
        <AddNodeSection
          nodes={prerequisiteNodes}
          setNodes={setPrerequisiteNodes}
          currentTree={currentTree}
          type="prereq"
        />

        <AddNodeSection
          nodes={objectiveNodes}
          setNodes={setObjectiveNodes}
          currentTree={currentTree}
          type="obj"
        />

        <MainTextSection
          setLearnText={setLearnText}
          setPracticeText={setPracticeText}
          setResourcesArray={setResourcesArray}
        />
        <div className={styles.submitButtonDiv}>
          <button onClick={handleSubmit}>Submit &rarr;</button>
        </div>
        <div></div>
      </form>
    </Suspense>
  );
}

function isNodeLinkedAsPrereqToModule(node, module, tree) {
  return (
    tree.links.filter((link) => {
      link.source === node.id && link.target === module.id;
    }).length > 0
  );
}

function isNodeLinkedAsObjToModule(node, module, tree) {
  return (
    tree.links.filter((link) => {
      link.target === node.id && link.source === module.id;
    }).length > 0
  );
}

export default ModuleModal;
