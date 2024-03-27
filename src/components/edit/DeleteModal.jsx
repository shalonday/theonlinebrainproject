import AlertDialog from "../AlertDialog";

function DeleteModal({open, setOpen}) {
  function handleNegBtnClick(){
    console.log('negbtnclick')
  }
  function handlePosBtnClick(){
    console.log('posbtnclick')
    // setCurrentTree((tree) => {
    //   const newTree = {
    //     nodes: tree.nodes.filter(node => node !== deletedNode ),
    //     links: tree.links,
    //   };
    //   return newTree;
    // });
  }
  return <AlertDialog open={open} setOpen={setOpen} negBtnText={"I Changed My Mind"} posBtnText={"Delete"} onNegBtnClick={handleNegBtnClick} onPosBtnClick = {handlePosBtnClick}>
    OBP doesn&apos;t allow submission of branches with hanging module nodes, but you can
    save this as a draft.
  (Hanging means the module node either has no prerequisites or no objective nodes)</AlertDialog>;
}

export default DeleteModal;
