import { useMutation } from "@tanstack/react-query";
import {
  upsertDraftBranch,
  upsertDraftLinks,
  upsertDraftNodes,
} from "../../services/apiBranches";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import MainButton from "../MainButton";
import { useUser } from "../../hooks/useUser";
import { uuidv4 } from "../../utils";

function SaveAsDraftButton({ state = null, currentTree, branchTitle }) {
  const navigate = useNavigate();
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

  async function handleSave() {
    const draftBranch = {
      id: state?.draft?.id ? state.draft.id : uuidv4(),
      title: branchTitle,
      nodeIds: currentTree.nodes.map((node) => node.id),
      linkIds: currentTree.links.map((link) => link.id),
      author_id: user.id,
      status: "draft",
    };

    // for each link and new module, add author_id if it doesn't exist  yet (nodes should already have authors added in AddNodeSection)
    const linksWithAuthors = currentTree.links
      .map((link) => {
        const { created_at, ...rest } = link;
        return rest;
        // remove created_at (effectively resetting database value of created_at every time we update).
        // Otherwise errors occur when some links have the created_at key and some don't
      })
      .map((link) =>
        !link.author_id ? { ...link, author_id: user.id } : link
      );

    const draftNodesByThisUser = currentTree.nodes.filter(node => 
      node.author_id === user.id
    ).map((node) => {
      const { fx, fy, index, vx, vy, x, y, created_at, ...rest } = node;
      return rest; // remove keys that we don't want to save
    })

    await mutateDraftNodes(draftNodesByThisUser);
    await mutateDraftLinks(linksWithAuthors);
    await mutateDraftBranch(draftBranch);

    if (!nodesError && !linksError && !branchError) navigate("/profile");
  }

  return <MainButton onClick={handleSave}>Save as Draft</MainButton>;
}

export default SaveAsDraftButton;
