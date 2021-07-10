export const deleteItem = async ({ item }) => {
  const type = item.image ? "image" : "text"
  const response = await fetch("http://localhost:4000/collection/delete?id=" + item.id + '&type=' + type, {
    method: "DELETE",
  })
  if (response.ok) {
    return response
  }
}
