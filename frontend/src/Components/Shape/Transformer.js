
function Transformer (props) {

	const {
		selectedShape
  	} = props;

  	const 

	useEffect(() => {

	})


	const checkNode = (e) => {
		const stage = e.target.getStage();
		stage.findOne("." + selectedShape);
		if (selectedNode === this.transformer.node()) {
	      return;
	    }
	    if (selectedNode) {
	      // attach to another node
	      this.transformer.attachTo(selectedNode);
	    } else {
	      // remove transformer
	      this.transformer.detach();
	    }
	    this.transformer.getLayer().batchDraw();
	  }

}
