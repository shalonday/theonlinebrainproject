import AlertDialog from "../AlertDialog";

function DeleteModal({open, setOpen, currentNode, setCurrentTree}) {
  function handleNegBtnClick(){
    setOpen(false);
  }
  function handlePosBtnClick(){
    setCurrentTree((tree) => {
      const newTree = {
        ...tree,
        nodes: tree.nodes.filter(node => node.id !== currentNode.id ),
        links: tree.links.filter(link => link.source !== currentNode.id && link.target !== currentNode.id), // filter out the links that have this node as target or as source (otherwise D3 will complain)
      };
      return newTree;
    });
    setOpen(false);
  }
  return <AlertDialog open={open} setOpen={setOpen} title="Delete this node?" negBtnText={"I Changed My Mind"} posBtnText={"Delete"} onNegBtnClick={handleNegBtnClick} onPosBtnClick = {handlePosBtnClick}>
      Note that this deletes any links attached to the node.
    </AlertDialog>;
}

export default DeleteModal;