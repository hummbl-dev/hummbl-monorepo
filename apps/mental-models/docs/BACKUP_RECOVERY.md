# Backup & Recovery Guide

**Purpose:** How to back up and restore your HUMMBL data

---

## 📦 What Gets Backed Up

- Bookmarks
- Notes
- Reading history
- Search history
- Preferences
- User profile

---

## 💾 Creating a Backup

### Manual Backup

1. Go to Settings → Backup & Recovery
2. Click "Download Backup"
3. Save the JSON file to a safe location

### Auto-Backup

1. Enable in Settings → Backup & Recovery
2. Backup downloads every 7 days automatically
3. Save files to cloud storage manually

---

## 🔄 Restoring from Backup

1. Go to Settings → Backup & Recovery
2. Click "Import Backup"
3. Select your backup JSON file
4. Confirm restoration
5. Page reloads automatically

⚠️ **Warning:** Restoration overwrites all current data!

---

## 🔒 Backup Format

JSON file with checksum for integrity verification:

- Version number
- Timestamp
- All user data
- Integrity checksum

---

## 🛠️ Troubleshooting

**"Checksum mismatch"** - Backup file corrupted, try different file

**"Invalid backup"** - Wrong file format, verify JSON file

**Auto-backup not working** - Check browser download permissions

---

## 💡 Best Practices

- Back up weekly for daily users
- Store in multiple locations (cloud + local)
- Keep last 4-5 backup versions
- Name files with dates: `hummbl-backup-2025-10-19.json`

---

**Version:** 1.0  
**Last Updated:** 2025-10-19
