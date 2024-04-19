import { useNavigate } from "react-router-dom";
import MainButton from "../MainButton";
import { useSave } from "../../hooks/useSave";

function SaveAsDraftButton({ state = null, currentTree, branchTitle }) {
  const navigate = useNavigate();

  const {save, nodesError, linksError, branchError} = useSave()

  async function handleSave() {
    console.log(state?.draft?.id)
    save({...currentTree, branchTitle}, 'draft', state?.draft?.id)
    if (!nodesError && !linksError && !branchError) navigate("/profile");
  }

  return <MainButton onClick={handleSave}>Save as Draft</MainButton>;
}

export default SaveAsDraftButton;
