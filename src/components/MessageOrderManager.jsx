//src/components/MessageOrderManager.jsx
import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

import MessageService from "../services/MessageService.js";

export default function MessageOrderManager() {
  const [loading, setLoading]   = useState(true);
  const [messages, setMessages] = useState([]);

  
  useEffect(() => {
    MessageService.list().then((ms) => {
      ms.sort((a, b) => a.order - b.order);
      setMessages(ms);
      setLoading(false);
    });
  }, []);


  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const srcIdx = result.source.index;
    const dstIdx = result.destination.index;
    if (srcIdx === dstIdx) return;

    // local update order
    const newMsgs = Array.from(messages);
    const [moved] = newMsgs.splice(srcIdx, 1);
    newMsgs.splice(dstIdx, 0, moved);

    // update order in the backend
    await MessageService.swapOrder(
      { id: newMsgs[srcIdx].id, order: srcIdx },
      { id: newMsgs[dstIdx].id, order: dstIdx }
    );

    // save new order
    setMessages(
      newMsgs.map((m, i) => ({
        ...m,
        order: i,
      }))
    );
  };

  if (loading)
    return (
      <Container sx={{ textAlign: "center", mt: 6 }}>
        <CircularProgress />
      </Container>
    );

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }} dir="rtl">
      <Typography variant="h5" textAlign="center" gutterBottom>
        שינוי סדר הודעות (Drag & Drop)
      </Typography>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="messages">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps}>
              {messages.map((m, idx) => (
                <Draggable key={m.id} draggableId={m.id} index={idx}>
                  {(prov, snapshot) => (
                    <Card
                      ref={prov.innerRef}
                      {...prov.draggableProps}
                      {...prov.dragHandleProps}
                      sx={{
                        mb: 2,
                        background: snapshot.isDragging ? "#f3e5f5" : "white",
                        border: "1px solid #91278F",
                      }}
                    >
                      <CardContent>
                        <Typography variant="subtitle1">{m.title}</Typography>
                        <Typography variant="body2">{m.body}</Typography>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Container>
  );
}
