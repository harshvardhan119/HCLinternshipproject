from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


model = tf.keras.models.load_model("model/lstm_model.h5")


scaler = MinMaxScaler()
scaler.fit(np.arange(0, 300).reshape(-1, 1))  


class InputData(BaseModel):
    last_60_days: list[float]


@app.post("/predict")
def predict_next_30_days(data: InputData):
    try:
        input_vals = np.array(data.last_60_days, dtype=np.float32)

        if len(input_vals) != 60:
            return {"error": "Exactly 60 values required."}

        input_sequence = input_vals.reshape(1, 60, 1)
        predictions = []

        for _ in range(30):
            next_pred = model.predict(input_sequence, verbose=0)[0][0]
            predictions.append(next_pred)
            input_sequence = np.append(input_sequence[:, 1:, :], [[[next_pred]]], axis=1)

        
        predictions = scaler.inverse_transform(np.array(predictions).reshape(-1, 1)).flatten().tolist()

        return {"forecast": predictions}

    except Exception as e:
        return {"error": str(e)}
