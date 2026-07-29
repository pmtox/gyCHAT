from fastapi import APIRouter, WebSocket


from app.websocket.manager import ConnectionManager


router = APIRouter()


manager = ConnectionManager()



@router.websocket("/ws/{user_id}")
async def websocket_endpoint(
    websocket:WebSocket,
    user_id:int
):

    await manager.connect(
        user_id,
        websocket
    )


    try:

        while True:


            data = await websocket.receive_json()


            receiver_id = data["receiver_id"]


            message = {

                "sender_id": user_id,

                "message": data["message"]

            }


            await manager.send_message(
                receiver_id,
                message
            )


    except Exception:

        manager.disconnect(user_id)