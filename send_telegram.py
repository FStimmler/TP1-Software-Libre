import requests
import os

def main():
    print("=== Enviar mensaje a Telegram ===")
    token = "7301757155:AAHgEJ74kSr0CxDpQwksLaZS04YWW6PTElE"
    chat_id = "6207797011"
    while True:
        msg = input("Mensaje (o 'salir' para terminar): ")
        if msg.lower() == 'salir':
            break
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        data = {"chat_id": chat_id, "text": msg}
        try:
            resp = requests.post(url, data=data)
            if resp.status_code == 200:
                print("✅ Mensaje enviado!")
            else:
                print(f"❌ Error: {resp.text}")
        except Exception as e:
            print(f"❌ Excepción: {e}")

if __name__ == "__main__":
    main()
