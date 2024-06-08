import { useUser } from "./useUser";
import { useMutation } from "@tanstack/react-query";
import { upsertDraftBranch, upsertDraftLinks, upsertDraftNodes } from "../services/apiBranches";
import toast from "react-hot-toast";
import { uuidv4 } from "../utils";

export function useSave(){
  const { user } = useUser();

  // mutate functions for upserting a branch draft
  const { mutateAsync: mutateDraftNodes, error: nodesError } = useMutation({
    mutationFn: upsertDraftNodes,
    onError: (err) => console.error("upsertDraftNodes error:" + err.message),
  });
  const { mutateAsync: mutateDraftLinks, error: linksError } = useMutation({
    mutationFn: upsertDraftLinks,
    onError: (err) => console.error("upsertDraftLinks error:" + err.message),
  });
  const { mutateAsync: mutateDraftBranch, error: branchError } = useMutation({
    mutationFn: upsertDraftBranch,
    onSuccess: () =>
      toast.success("Branch draft has been saved to your account"),
    onError: (err) => console.error("upsertDraftBranch error:" + err.message),
  });


  /* Called upon pressing SaveAsDraft or Submit at the Edit page. This saves the branch as either a draft or a submission
  *@param {object} branch - The branch object to be saved. Has the shape {node:[],links:[], title:''}
  *@param {oneOf ['draft', 'submission']} - specifies whether we're saving the branch as a draft or as a submission
  *
   */
    // try to make this fit both the SaveAsDraft and the Submit btn?
  async function save(branch, saveType, draftId = '') {

    let nodesToSave = []
    let linksToSave = []
    let branchToSave;

    if (saveType==='draft'){
    branchToSave = {
      id: draftId ? draftId : uuidv4(),
      title: branch.branchTitle,
      nodeIds: branch.nodes.map((node) => node.id),
      linkIds: branch.links.map((link) => link.id),
      author_id: user.id,
      status: "draft",
      rootedNodes: branch.rootedNodes
    };

    // for each link and new module, add author_id if it doesn't exist  yet (nodes should already have authors added in AddNodeSection)
    linksToSave = branch.links
      .map((link) => {
        const { created_at, ...rest } = link;
        return rest;
        // remove created_at (effectively resetting database value of created_at every time we update).
        // Otherwise errors occur when some links have the created_at key and some don't
      })
      .map((link) =>
        !link.author_id ? { ...link, author_id: user.id } : link
      );

    nodesToSave = branch.nodes.filter(node => 
      // node.author_id === user.id !!! temporarily set to true for testing; preexisting nodes don't have an author yet and won't pass this test.
      true
    ).map((node) => {
      const { fx, fy, index, vx, vy, x, y, created_at, ...rest } = node;
      return rest; // remove keys that we don't want to save
    })

    } else if (saveType === 'submission'){
    // set nodes, links and branches to appropriate values
    const dividedBranch = divideBranchIntoRootedAndHanging(branch)
    console.log(dividedBranch)

    // !!! copypasted from old submission function
    const statusSubmittedLinks = branch.links.map(link => { return user.id === link.author_id ? {...link, status: 'submitted'} : link})
          const statusSubmittedNodes = branch.nodes.map(node => { return user.id === node.author_id ? {...node, status: 'submitted'} : node})
          const branchSubmission = {nodes: statusSubmittedNodes, links: statusSubmittedLinks}
          console.log(branch)
          console.log(branchSubmission)
          sendSubmissionToAdmin(branchSubmission)
    }
        // //go back to Home page
        // navigate("/");

        console.log(nodesToSave)
        console.log(linksToSave)
        console.log(branchToSave)
        await mutateDraftNodes(nodesToSave);
        await mutateDraftLinks(linksToSave);
        await mutateDraftBranch(branchToSave);
    
  }


    
  return {save, nodesError, linksError, branchError}
}


function sendSubmissionToAdmin(){
  // !!! save submission to admin-access DB of submissions. (then create a dashboard for submissions for admin users)
 
}

/*
*!!!
* @param {object} branch
* @returns {object} dividedBranch. An object with two properties: {rootedBranch, hangingBranches}
*   where rootedBranch is an object of the shape {nodes:[], links:[]} where all nodes and links have isRooted===true
*   and where hangingBranches is an array of objects of the shape {nodes:[], links:[]} where each object has at least 
*   one node that has isRooted===false and everything related to that node
**/
function divideBranchIntoRootedAndHanging(branch){
  // just a stub that returns the same branch as before, assuming it's all rooted
  return {rootedBranch:{nodes:branch.nodes, links:branch.links}, hangingBranches:[] }
}