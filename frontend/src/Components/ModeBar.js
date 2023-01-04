import React, { useState } from 'react'

import {ToggleButtonGroup, ToggleButton, SvgIcon, TextField, Box} from "@mui/material";
import CreateIcon from '@mui/icons-material/Create';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import TransformIcon from '@mui/icons-material/Transform';

function ModeBar(props) {

	const {tool, 
        setTool,
        clear,
        pairFunction,
        setPairFunction,
        joinFunction,
        setJoinFunction,
        width,
        setWidth,
        height,
        setHeight,
        } = props

  const [w, setW] = useState(600);
  const [h, setH] = useState(400);

	const handleOnChange = (e, newTool) => {
      setTool(newTool);

      if ( newTool === "eraser") {
        clear();
      } 

      if (newTool === "pen") {
        setPairFunction("add")
      } else {
        setPairFunction()
      }

      if (newTool === "cut") {
        setPairFunction("cut")
      } else {
        setPairFunction()
      }

  }

  const handlePairFunctionOnChange = (e, newFunction) => {
    setPairFunction(newFunction)
  }

  const joinOnChange = (e, newFunction) => {
    setJoinFunction(newFunction)
  }

  const handleWidth = (e) => {
    if (e.target.value) {
      setW(parseInt(e.target.value))
    } else {
      setW(0)
    }
    
    if (e.key === 'Enter') {
      setWidth(w)
    }

  }

  const handleHeight = (e) => {
    if (e.target.value) {
      setH(parseInt(e.target.value))
    } else {
      setH(0)
    }
    if (e.key === 'Enter') {
      setHeight(h)
    }
  }

	return (

    <div>

      <ToggleButtonGroup
        value={tool}
        exclusive
        onChange= {handleOnChange}
      >
        <ToggleButton value="cursor" aria-label="cursor">
            <SvgIcon>
              <path d="m3 3l7 19l2.051-6.154a6 6 0 0 1 3.795-3.795L22 10L3 3Z"/>
            </SvgIcon>
        </ToggleButton>
          <ToggleButton value="cut" aria-label="cut">
            <ContentCutIcon />
          </ToggleButton>
          <ToggleButton value="pen" aria-label="pen">
            <CreateIcon />
          </ToggleButton>
          <ToggleButton value="transform" aria-label="transform">
            <TransformIcon />
          </ToggleButton>
          <ToggleButton value="eraser" aria-label="eraser">
            <SvgIcon>
              <path d="M12.48 3L7.73 7.75L3 12.59a2 2 0 0 0 0 2.82l4.3 4.3A1 1 0 0 0 8 20h12v-2h-7l7.22-7.22a2 2 0 0 0 0-2.83L15.31 3a2 2 0 0 0-2.83 0zM8.41 18l-4-4l4.75-4.84l.74-.75l4.95 4.95l-4.56 4.56l-.07.08z" />
            </SvgIcon>
          </ToggleButton>
      </ToggleButtonGroup>

      {tool === "cut"
        && <ToggleButtonGroup
            size = "small"
            value = {joinFunction} 
            exclusive
            onChange= {joinOnChange}  
           >
              <ToggleButton value ="cut">Cut</ToggleButton>
              <ToggleButton value="join">Join</ToggleButton>
            </ToggleButtonGroup>
      }

      {tool === "pen"
        && <ToggleButtonGroup
            size = "small"
            value = {pairFunction} 
            exclusive
            onChange= {handlePairFunctionOnChange}  
           >
              <ToggleButton value ="add">Add</ToggleButton>
              <ToggleButton value="remove">Remove</ToggleButton>
            </ToggleButtonGroup>
      }

      <Box
        component="form"
        sx={{
          '& > :not(style)': { m: 1, width: '15ch', height: '5ch' },
        }}
        noValidate
        autoComplete="off"
      >
        <TextField
          label = "width"
          value = {w}
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          onChange = {handleWidth}
          onKeyPress = {handleWidth}
        />
        <TextField 
          label = "height"
          value = {h}
          inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          onKeyPress = {handleHeight}
          onChange = {handleHeight}
        />
    </Box>
      

    </div>


    )
};

export default ModeBar;