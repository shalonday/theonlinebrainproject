import AlertDialog from "../AlertDialog";

function DeleteModal({open, setOpen}) {
  return <AlertDialog open={open} setOpen={setOpen} negBtnText={"I Changed My Mind"} posBtnText={"Delete"}>
    OBP doesn&apos;t allow submission of branches with hanging module nodes, but you can
    save this as a draft.
  (Hanging means the module node either has no prerequisites or no objective nodes)</AlertDialog>;
}

export default DeleteModal;
