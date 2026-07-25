import json
import os

DEFAULT_PRINTER_CONFIG = {
    "active_profile": "58mm_thermal",
    "store_info": {
        "name": "AL AIN BOUTIQUE",
        "address": "Main Street, City Center",
        "phone": "+91 9876543210",
        "tax_id": "GSTIN123456789",
        "footer": "Thank you for shopping with us!"
    },
    "profiles": {
        "58mm_thermal": {
            "name": "58mm Thermal Microprinter (POS Receipt)",
            "width_mm": 58,
            "dpi": 203,
            "char_per_line": 32,
            "cut_command": "\x1dB\x00"
        },
        "80mm_thermal": {
            "name": "80mm Thermal Receipt Printer",
            "width_mm": 80,
            "dpi": 203,
            "char_per_line": 48,
            "cut_command": "\x1dB\x00"
        },
        "label_100x25": {
            "name": "100mm x 25mm Thermal Label Sticker",
            "width_mm": 100,
            "height_mm": 25,
            "char_per_line": 40
        }
    }
}

class MicroprinterConfig:
    def __init__(self, config_path="printer_config.json"):
        self.config_path = config_path
        self.config = self.load_config()

    def load_config(self):
        if os.path.exists(self.config_path):
            try:
                with open(self.config_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception:
                return DEFAULT_PRINTER_CONFIG
        return DEFAULT_PRINTER_CONFIG

    def save_config(self):
        with open(self.config_path, "w", encoding="utf-8") as f:
            json.dump(self.config, f, indent=2)

    def get_active_profile(self):
        profile_key = self.config.get("activeProfile", "58mm_thermal")
        return self.config.get("profiles", {}).get(profile_key, DEFAULT_PRINTER_CONFIG["profiles"]["58mm_thermal"])

if __name__ == "__main__":
    printer = MicroprinterConfig()
    print("Active Microprinter Profile:", printer.get_active_profile())
