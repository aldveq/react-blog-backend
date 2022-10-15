const getPostName = postStr => {
	if (postStr.includes(' ')) {
		return postStr.split(' ').join('-').toLowerCase();
	} else {
		return postStr.toLowerCase();
	}
}

export { getPostName }