import AlertDialog from "../AlertDialog";

function DeleteModal({open, setOpen, currentNode, setCurrentTree}) {
  function handleNegBtnClick(){
    setOpen(false);
  }
  function handlePosBtnClick(){
    setCurrentTree((tree) => {
      const newTree = {
        nodes: tree.nodes.filter(node => node.id !== currentNode.id ),
        links: tree.links.filter(link => link.source !== currentNode.id && link.target !== currentNode.id), // filter out the links that have this node as target or as source (otherwise D3 will complain)
      };
      return newTree;
    });
  }
  return <AlertDialog open={open} setOpen={setOpen} negBtnText={"I Changed My Mind"} posBtnText={"Delete"} onNegBtnClick={handleNegBtnClick} onPosBtnClick = {handlePosBtnClick}>
    OBP doesn&apos;t allow submission of branches with hanging module nodes, but you can
    save this as a draft.
  (Hanging means the module node either has no prerequisites or no objective nodes)</AlertDialog>;
}

export default DeleteModal;
