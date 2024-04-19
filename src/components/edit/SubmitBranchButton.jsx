import * as React from 'react';
import { useUser } from "../../hooks/useUser";
import MainButton from "../MainButton";
import PropTypes from 'prop-types';
import { useSave } from '../../hooks/useSave';

export default function SubmitBranchButton(props){
  
  const {save} = useSave();
    async function handleSubmit(branch) {
        // !!! validation?
        console.log(validateSubmittedTree(branch))
        if (validateSubmittedTree(branch)) {
          save({...props.currentTree, branchTitle: props.branchTitle}, "submission")
      }
    } 
    
      function validateSubmittedTree(tree){
        const disconnectedNodeIdsArr = getDisconnectedNodes(tree);
        const areModuleNodesValid = validateNoDisconnectedModuleNodes(disconnectedNodeIdsArr, tree.nodes.filter(node => node.type === 'module').map(moduleNode => moduleNode.id))
        if (!areModuleNodesValid){ 
          alert('There are hanging module nodes. Please fix this') // !!! switch to RHF eventually and encapsulate all error messages
        }
        validateSkillNodes(disconnectedNodeIdsArr, tree.nodes.filter(node => node.type === 'skill'))
        return areModuleNodesValid && props.areSkillNodesValid
      }
    
      // if there are any hanging module nodes, alert and fail validation immediately
      function validateNoDisconnectedModuleNodes(disconnectedNodeIdsArr, moduleNodesIdsArr){
        let noDisconnectedModuleNodes = true
        
        if (disconnectedNodeIdsArr.length > 0) { 
          disconnectedNodeIdsArr.forEach(disconnectedNodeId => {
          if (moduleNodesIdsArr.includes(disconnectedNodeId)) noDisconnectedModuleNodes = false;
        })
        }
        
        return noDisconnectedModuleNodes;
      }
    
      function validateSkillNodes(disconnectedNodeIdsArr, skillNodesArr){
        // !!! Hanging skill nodes should trigger an AlertDialog.
        // hanging skill nodes' names should be listed to inform the user that they won't be added to the tree but instead requested to be linked to an existing node in the tree.
        alertUserAboutDisconnectedSkillNodes(disconnectedNodeIdsArr, skillNodesArr)
        if (props.disconnectedSkillNodeDescriptions.length === 0) props.setAreSkillNodesValid(true)
        // !!! once I can incorporate NLP, check for duplicate skill nodes here
      }
    
      function getDisconnectedNodes(tree){
        // create set of sources and targets then compare this set with nodesSet. 
        // if nodesSet contains nodes that are not in sources and targets, then those nodes are "disconnected", whereas "hanging" means that a node or branch is not connected to the main tree
        const nodesSet = new Set(tree.nodes.map(node=> node.id))
    
        const connectedNodesSet = new Set();
        tree.links.forEach(link => {
          connectedNodesSet.add(link.source)
          connectedNodesSet.add(link.target)
        })
    
        let disconnectedNodesArr = [];
        nodesSet.difference(connectedNodesSet).forEach(item => disconnectedNodesArr.push(item))
        return disconnectedNodesArr
      }
    
      // set up the AlertDialog that informs user of disconnected skill nodes being added to Requests
      function alertUserAboutDisconnectedSkillNodes(disconnectedNodeIdsArr, skillNodesArr){
        let disconnectedSkillNodesArr = []
        
        if (disconnectedNodeIdsArr.length > 0) { 
          disconnectedNodeIdsArr.forEach(disconnectedNodeId => {
          if (skillNodesArr.map(node => node.id).includes(disconnectedNodeId)) {
            disconnectedSkillNodesArr.push(skillNodesArr.filter(node => node.id === disconnectedNodeId)[0])
          }
        })
        }
        if (disconnectedSkillNodesArr.length > 0){
          const nodeDescriptionsArr = disconnectedSkillNodesArr.map(node => node.description)
          props.setDisconnectedSkillNodeDescriptions(nodeDescriptionsArr)
          props.setIsAlertDialogOpen(true)
        }
    
      }

      return  <MainButton onClick={()=>handleSubmit(props.currentTree)}>Submit</MainButton>
}

SubmitBranchButton.propTypes={
    setDisconnectedSkillNodeDescriptions:PropTypes.func,
    areSkillNodesValid:PropTypes.bool,
    setAreSkillNodesValid:PropTypes.func,
    setIsAlertDialogOpen:PropTypes.func,
    disconnectedSkillNodeDescriptions:PropTypes.array,
    state:PropTypes.object,
    currentTree:PropTypes.object,
    branchTitle:PropTypes.string
}