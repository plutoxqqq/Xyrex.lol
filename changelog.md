# Changelog

## 2026-06-27

### Fixed
- Tightened the AetherBeds AntiCheat speed validation so increased player speed values are detected instead of being treated as the new allowed movement cap.
- Kept legitimate speed sources safe by accounting for Speed Boots, the Assassin kit, and the Speed Lines battlepass reward before flagging suspicious speed changes.

### Changed
- Updated normal movement speed enforcement to use a derived legitimate speed limit rather than the mutable `player.speed` value that speed modules can modify.
