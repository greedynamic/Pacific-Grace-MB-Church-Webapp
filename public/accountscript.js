function confirmDeletion() {
    const deleteButton = document.getElementById("deleteButton");
    if(confirm("Are you sure you want to delete your account?\nThis change cannot be undone.") == true) {
        deleteButton.setAttribute("value", "delete")
    }
}