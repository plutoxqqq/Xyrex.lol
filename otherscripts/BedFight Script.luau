--[[
    Xyrex BedFight Utility Suite
    Complete rewrite inspired by AetherCore's BedWars quality-of-life modules.

    Goals:
    - Pure Roblox UI with no external dependencies.
    - Safer connection cleanup and respawn restoration.
    - Lightweight scans instead of expensive per-frame Workspace traversal.
    - Movement, combat, automation, visual, and match-awareness utilities.

    Default UI toggle: RightShift
]]

--// Services
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Workspace = game:GetService("Workspace")
local CoreGui = game:GetService("CoreGui")
local VirtualInputManager = game:GetService("VirtualInputManager")

local LocalPlayer = Players.LocalPlayer
local Camera = Workspace.CurrentCamera

if not LocalPlayer then
	error("Xyrex BedFight could not start because LocalPlayer is unavailable.")
end

--// Configuration
local Config = {
	ToggleKey = Enum.KeyCode.RightShift,
	FlySpeed = 55,
	Speed = 30,
	KillAuraRange = 16,
	KillAuraDelay = 0.12,
	AutoClickerCPS = 10,
	AutoWinDelay = 0.45,
	SearchRefreshRate = 2.5,
	ThreatRange = 80,
	MaxMarkers = 40,
}

--// Runtime state
local State = {
	GuiEnabled = true,
	Destroyed = false,
	Features = {},
	FeatureConnections = {},
	FeatureInstances = {},
	Threads = {},
	FlyKeys = {
		W = false,
		A = false,
		S = false,
		D = false,
		Space = false,
		LeftControl = false,
		LeftShift = false,
	},
	BaseWalkSpeed = 16,
	BaseJumpPower = 50,
	BaseJumpHeight = 7.2,
	FocusMuteVolumes = {},
	FocusMuteMuted = false,
	OriginalFOV = Camera and Camera.FieldOfView or 70,
	CachedBeds = {},
	CachedResources = {},
	CachedRemotes = {},
	LastWorkspaceScan = 0,
}

--// General helpers
local function safeDisconnect(connection)
	if connection then
		pcall(function()
			connection:Disconnect()
		end)
	end
end

local function safeDestroy(instance)
	if typeof(instance) == "Instance" then
		pcall(function()
			instance:Destroy()
		end)
	end
end

local function clearList(list, destroyItems)
	for _, item in ipairs(list) do
		if destroyItems then
			safeDestroy(item)
		else
			safeDisconnect(item)
		end
	end
	table.clear(list)
end

local function clearBucket(bucketName, destroyItems)
	local bucket = destroyItems and State.FeatureInstances[bucketName] or State.FeatureConnections[bucketName]
	if bucket then
		clearList(bucket, destroyItems)
	end
end

local function trackConnection(bucketName, connection)
	State.FeatureConnections[bucketName] = State.FeatureConnections[bucketName] or {}
	table.insert(State.FeatureConnections[bucketName], connection)
	return connection
end

local function trackInstance(bucketName, instance)
	State.FeatureInstances[bucketName] = State.FeatureInstances[bucketName] or {}
	table.insert(State.FeatureInstances[bucketName], instance)
	return instance
end

local function getCharacterParts(player)
	player = player or LocalPlayer
	local character = player.Character
	if typeof(character) ~= "Instance" then
		return nil, nil, nil
	end

	local humanoid = character:FindFirstChildOfClass("Humanoid")
	local rootPart = character:FindFirstChild("HumanoidRootPart")
	return character, humanoid, rootPart
end

local function isAlive(player)
	local _, humanoid, rootPart = getCharacterParts(player)
	return humanoid ~= nil and rootPart ~= nil and humanoid.Health > 0
end

local function isOpponent(player)
	if not player or player == LocalPlayer then
		return false
	end

	if LocalPlayer.Team ~= nil and player.Team ~= nil then
		return player.Team ~= LocalPlayer.Team
	end

	return true
end

local function containsKeyword(text, keywords)
	text = tostring(text or ""):lower()
	for _, keyword in ipairs(keywords) do
		if text:find(keyword, 1, true) then
			return true
		end
	end
	return false
end

local function notify(title, message)
	title = tostring(title or "Xyrex BedFight")
	message = tostring(message or "")
	pcall(function()
		game:GetService("StarterGui"):SetCore("SendNotification", {
			Title = title,
			Text = message,
			Duration = 4,
		})
	end)
	print(("[%s] %s"):format(title, message))
end

local function getGuiParent()
	local playerGui = LocalPlayer:FindFirstChildOfClass("PlayerGui")
	if playerGui then
		return playerGui
	end

	local ok, result = pcall(function()
		return CoreGui
	end)
	return ok and result or nil
end

local function setText(button, enabled)
	button.Text = enabled and "ON" or "OFF"
	button.BackgroundColor3 = enabled and Color3.fromRGB(56, 189, 122) or Color3.fromRGB(185, 58, 58)
end

local function startThread(name, callback)
	State.Threads[name] = (State.Threads[name] or 0) + 1
	local token = State.Threads[name]
	task.spawn(function()
		callback(function()
			return not State.Destroyed and State.Threads[name] == token and State.Features[name] == true
		end)
	end)
end

local function stopThread(name)
	State.Threads[name] = (State.Threads[name] or 0) + 1
end

local function getEquippedTool()
	local character = LocalPlayer.Character
	return character and character:FindFirstChildOfClass("Tool") or nil
end

local function equipToolByKeywords(keywords)
	local character, humanoid = getCharacterParts()
	if not character or not humanoid then
		return nil
	end

	local currentTool = character:FindFirstChildOfClass("Tool")
	if currentTool and containsKeyword(currentTool.Name, keywords) then
		return currentTool
	end

	local backpack = LocalPlayer:FindFirstChildOfClass("Backpack")
	if not backpack then
		return currentTool
	end

	for _, item in ipairs(backpack:GetChildren()) do
		if item:IsA("Tool") and containsKeyword(item.Name, keywords) then
			pcall(function()
				humanoid:EquipTool(item)
			end)
			return item
		end
	end

	return currentTool
end

local function activateTool(tool)
	tool = tool or getEquippedTool()
	if tool then
		pcall(function()
			tool:Activate()
		end)
		return true
	end
	return false
end

local function refreshCamera()
	Camera = Workspace.CurrentCamera
	return Camera
end

--// Workspace and remote discovery
local BED_KEYWORDS = { "bed" }
local RESOURCE_KEYWORDS = { "iron", "diamond", "emerald", "gold", "resource" }
local DAMAGE_REMOTE_KEYWORDS = { "damage", "attack", "sword", "combat", "hit" }
local BED_REMOTE_KEYWORDS = { "bed", "break", "destroy" }

local function scanWorkspace(force)
	local now = os.clock()
	if not force and now - State.LastWorkspaceScan < Config.SearchRefreshRate then
		return
	end

	State.LastWorkspaceScan = now
	table.clear(State.CachedBeds)
	table.clear(State.CachedResources)

	local markedResources = 0
	for _, object in ipairs(Workspace:GetDescendants()) do
		if object:IsA("BasePart") then
			if containsKeyword(object.Name, BED_KEYWORDS) then
				table.insert(State.CachedBeds, object)
			elseif markedResources < Config.MaxMarkers and containsKeyword(object.Name, RESOURCE_KEYWORDS) then
				markedResources = markedResources + 1
				table.insert(State.CachedResources, object)
			end
		end
	end
end

local function findLikelyRemote(keywords)
	for _, cached in ipairs(State.CachedRemotes) do
		if cached.Parent and containsKeyword(cached.Name, keywords) then
			return cached
		end
	end

	table.clear(State.CachedRemotes)
	for _, object in ipairs(ReplicatedStorage:GetDescendants()) do
		if object:IsA("RemoteEvent") or object:IsA("RemoteFunction") then
			table.insert(State.CachedRemotes, object)
			if containsKeyword(object.Name, keywords) then
				return object
			end
		end
	end

	return nil
end

local function fireRemote(remote, ...)
	if not remote then
		return false
	end

	local arguments = { ... }
	if remote:IsA("RemoteEvent") then
		return pcall(function()
			remote:FireServer(table.unpack(arguments))
		end)
	end

	if remote:IsA("RemoteFunction") then
		return pcall(function()
			remote:InvokeServer(table.unpack(arguments))
		end)
	end

	return false
end

local function getNearestBed()
	scanWorkspace(false)
	local _, _, rootPart = getCharacterParts()
	if not rootPart then
		return nil
	end

	local closestBed = nil
	local closestDistance = math.huge
	for _, bed in ipairs(State.CachedBeds) do
		if bed.Parent then
			local distance = (bed.Position - rootPart.Position).Magnitude
			if distance < closestDistance then
				closestDistance = distance
				closestBed = bed
			end
		end
	end
	return closestBed, closestDistance
end

local function getNearestOpponent(maxDistance)
	local _, _, rootPart = getCharacterParts()
	if not rootPart then
		return nil
	end

	local closestPlayer = nil
	local closestDistance = maxDistance or math.huge
	for _, player in ipairs(Players:GetPlayers()) do
		if isOpponent(player) and isAlive(player) then
			local _, _, targetRoot = getCharacterParts(player)
			local distance = (targetRoot.Position - rootPart.Position).Magnitude
			if distance <= closestDistance then
				closestDistance = distance
				closestPlayer = player
			end
		end
	end

	return closestPlayer, closestDistance
end

local function teleportTo(position)
	local _, _, rootPart = getCharacterParts()
	if not rootPart then
		return false
	end

	rootPart.CFrame = CFrame.new(position)
	return true
end

--// Feature implementations
local function setNoKnockback(enabled)
	State.Features.NoKnockback = enabled
	clearBucket("NoKnockback", true)

	if not enabled then
		return
	end

	local _, _, rootPart = getCharacterParts()
	if not rootPart then
		return
	end

	local attachment = Instance.new("Attachment")
	attachment.Name = "XyrexNoKnockbackAttachment"
	attachment.Parent = rootPart
	trackInstance("NoKnockback", attachment)

	local velocity = Instance.new("LinearVelocity")
	velocity.Name = "XyrexNoKnockbackVelocity"
	velocity.Attachment0 = attachment
	velocity.MaxForce = 900000
	velocity.VectorVelocity = Vector3.zero
	velocity.RelativeTo = Enum.ActuatorRelativeTo.World
	velocity.Parent = rootPart
	trackInstance("NoKnockback", velocity)
end

local function setSpeed(enabled)
	State.Features.Speed = enabled
	local _, humanoid = getCharacterParts()
	if not humanoid then
		return
	end

	if enabled then
		State.BaseWalkSpeed = humanoid.WalkSpeed
		humanoid.WalkSpeed = Config.Speed
	else
		humanoid.WalkSpeed = State.BaseWalkSpeed or 16
	end
end

local function updateSpeed(value)
	Config.Speed = value
	if State.Features.Speed then
		local _, humanoid = getCharacterParts()
		if humanoid then
			humanoid.WalkSpeed = Config.Speed
		end
	end
end

local function setInfiniteJump(enabled)
	State.Features.InfiniteJump = enabled
	clearBucket("InfiniteJump", false)

	if not enabled then
		return
	end

	trackConnection(
		"InfiniteJump",
		UserInputService.JumpRequest:Connect(function()
			local _, humanoid = getCharacterParts()
			if humanoid and humanoid.Health > 0 then
				humanoid:ChangeState(Enum.HumanoidStateType.Jumping)
			end
		end)
	)
end

local function setFly(enabled)
	State.Features.Fly = enabled
	clearBucket("Fly", false)
	clearBucket("Fly", true)

	local _, humanoid, rootPart = getCharacterParts()
	if not humanoid or not rootPart then
		return
	end

	humanoid.PlatformStand = enabled
	for key in pairs(State.FlyKeys) do
		State.FlyKeys[key] = false
	end

	if not enabled then
		return
	end

	local attachment = Instance.new("Attachment")
	attachment.Name = "XyrexFlyAttachment"
	attachment.Parent = rootPart
	trackInstance("Fly", attachment)

	local velocity = Instance.new("LinearVelocity")
	velocity.Name = "XyrexFlyVelocity"
	velocity.Attachment0 = attachment
	velocity.MaxForce = 900000
	velocity.VectorVelocity = Vector3.zero
	velocity.RelativeTo = Enum.ActuatorRelativeTo.World
	velocity.Parent = rootPart
	trackInstance("Fly", velocity)

	local gyro = Instance.new("AlignOrientation")
	gyro.Name = "XyrexFlyOrientation"
	gyro.Attachment0 = attachment
	gyro.Mode = Enum.OrientationAlignmentMode.OneAttachment
	gyro.MaxTorque = 900000
	gyro.Responsiveness = 18
	gyro.Parent = rootPart
	trackInstance("Fly", gyro)

	trackConnection(
		"Fly",
		UserInputService.InputBegan:Connect(function(input, processed)
			if processed then
				return
			end
			local key = input.KeyCode.Name
			if State.FlyKeys[key] ~= nil then
				State.FlyKeys[key] = true
			end
		end)
	)

	trackConnection(
		"Fly",
		UserInputService.InputEnded:Connect(function(input)
			local key = input.KeyCode.Name
			if State.FlyKeys[key] ~= nil then
				State.FlyKeys[key] = false
			end
		end)
	)

	trackConnection(
		"Fly",
		RunService.Heartbeat:Connect(function()
			if not State.Features.Fly then
				return
			end

			refreshCamera()
			local _, currentHumanoid, currentRoot = getCharacterParts()
			if not Camera or not currentHumanoid or not currentRoot then
				return
			end

			local direction = Vector3.zero
			local look = Camera.CFrame.LookVector
			local right = Camera.CFrame.RightVector

			if State.FlyKeys.W then
				direction = direction + look
			end
			if State.FlyKeys.S then
				direction = direction - look
			end
			if State.FlyKeys.A then
				direction = direction - right
			end
			if State.FlyKeys.D then
				direction = direction + right
			end
			if State.FlyKeys.Space then
				direction = direction + Vector3.new(0, 1, 0)
			end
			if State.FlyKeys.LeftControl or State.FlyKeys.LeftShift then
				direction = direction - Vector3.new(0, 1, 0)
			end

			if direction.Magnitude > 0 then
				velocity.VectorVelocity = direction.Unit * Config.FlySpeed
			else
				velocity.VectorVelocity = Vector3.zero
			end
			gyro.CFrame = CFrame.lookAt(currentRoot.Position, currentRoot.Position + look)
		end)
	)
end

local function attackPlayer(player)
	local character = player and player.Character
	local humanoid = character and character:FindFirstChildOfClass("Humanoid")
	if not character or not humanoid or humanoid.Health <= 0 then
		return false
	end

	local sword = equipToolByKeywords({ "sword", "blade", "dagger", "scythe", "hammer", "axe" })
	if activateTool(sword) then
		return true
	end

	local damageRemote = findLikelyRemote(DAMAGE_REMOTE_KEYWORDS)
	return fireRemote(damageRemote, character, humanoid)
end

local function setKillAura(enabled)
	State.Features.KillAura = enabled
	stopThread("KillAura")

	if not enabled then
		return
	end

	startThread("KillAura", function(isRunning)
		while isRunning() do
			local target = getNearestOpponent(Config.KillAuraRange)
			if target then
				attackPlayer(target)
			end
			task.wait(math.max(Config.KillAuraDelay, 0.05))
		end
	end)
end

local function setAutoClicker(enabled)
	State.Features.AutoClicker = enabled
	stopThread("AutoClicker")

	if not enabled then
		return
	end

	startThread("AutoClicker", function(isRunning)
		while isRunning() do
			if not activateTool() then
				pcall(function()
					VirtualInputManager:SendMouseButtonEvent(0, 0, 0, true, game, 0)
					VirtualInputManager:SendMouseButtonEvent(0, 0, 0, false, game, 0)
				end)
			end
			task.wait(1 / math.clamp(Config.AutoClickerCPS, 1, 30))
		end
	end)
end

local function breakBed(bed)
	if not bed or not bed.Parent then
		return false
	end

	teleportTo(bed.Position + Vector3.new(0, 5, 0))
	task.wait(0.12)

	local pickaxe = equipToolByKeywords({ "pickaxe", "axe" })
	local startedAt = os.clock()
	while State.Features.AutoWin and bed.Parent and os.clock() - startedAt < 4 do
		if pickaxe then
			activateTool(pickaxe)
		else
			local bedRemote = findLikelyRemote(BED_REMOTE_KEYWORDS)
			fireRemote(bedRemote, bed)
		end
		task.wait(0.15)
	end

	return bed.Parent == nil
end

local function setAutoWin(enabled)
	State.Features.AutoWin = enabled
	stopThread("AutoWin")

	if not enabled then
		return
	end

	notify("AutoWin", "Enabled. The script will target visible beds first, then opponents.")
	startThread("AutoWin", function(isRunning)
		while isRunning() do
			scanWorkspace(true)

			for _, bed in ipairs(State.CachedBeds) do
				if not isRunning() then
					break
				end
				if bed.Parent then
					breakBed(bed)
					task.wait(Config.AutoWinDelay)
				end
			end

			for _, player in ipairs(Players:GetPlayers()) do
				if not isRunning() then
					break
				end
				if isOpponent(player) and isAlive(player) then
					local _, _, targetRoot = getCharacterParts(player)
					if targetRoot then
						teleportTo(targetRoot.Position + Vector3.new(0, 2, 2))
						for _ = 1, 24 do
							if not isRunning() or not isAlive(player) then
								break
							end
							attackPlayer(player)
							task.wait(0.08)
						end
					end
				end
			end

			task.wait(math.max(Config.AutoWinDelay, 0.2))
		end
	end)
end

--// AetherCore-inspired visual and utility modules
local function makeBillboard(adornee, text, color)
	local billboard = Instance.new("BillboardGui")
	billboard.Name = "XyrexMarker"
	billboard.Adornee = adornee
	billboard.AlwaysOnTop = true
	billboard.LightInfluence = 0
	billboard.MaxDistance = 650
	billboard.Size = UDim2.fromOffset(132, 34)
	billboard.StudsOffsetWorldSpace = Vector3.new(0, 3.35, 0)

	local label = Instance.new("TextLabel")
	label.BackgroundTransparency = 0.2
	label.BackgroundColor3 = Color3.fromRGB(15, 18, 25)
	label.BorderSizePixel = 0
	label.Font = Enum.Font.GothamBold
	label.Size = UDim2.fromScale(1, 1)
	label.Text = text
	label.TextColor3 = color or Color3.fromRGB(255, 255, 255)
	label.TextScaled = true
	label.Parent = billboard

	billboard.Parent = adornee
	return billboard
end

local function makeHighlight(target, color, transparency)
	local highlight = Instance.new("Highlight")
	highlight.Name = "XyrexHighlight"
	highlight.Adornee = target
	highlight.DepthMode = Enum.HighlightDepthMode.AlwaysOnTop
	highlight.FillColor = color
	highlight.FillTransparency = transparency or 0.72
	highlight.OutlineColor = color
	highlight.OutlineTransparency = 0.08
	highlight.Parent = target
	return highlight
end

local function setPlayerESP(enabled)
	State.Features.PlayerESP = enabled
	clearBucket("PlayerESP", false)
	clearBucket("PlayerESP", true)

	if not enabled then
		return
	end

	local function markPlayer(player)
		if not State.Features.PlayerESP or not isOpponent(player) then
			return
		end
		local character = player.Character
		if not character or character:FindFirstChild("XyrexHighlight") then
			return
		end
		trackInstance("PlayerESP", makeHighlight(character, Color3.fromRGB(255, 80, 80), 0.68))
	end

	for _, player in ipairs(Players:GetPlayers()) do
		markPlayer(player)
		trackConnection(
			"PlayerESP",
			player.CharacterAdded:Connect(function()
				task.wait(0.35)
				markPlayer(player)
			end)
		)
	end

	trackConnection(
		"PlayerESP",
		Players.PlayerAdded:Connect(function(player)
			trackConnection(
				"PlayerESP",
				player.CharacterAdded:Connect(function()
					task.wait(0.35)
					markPlayer(player)
				end)
			)
		end)
	)
end

local function setBedBeacon(enabled)
	State.Features.BedBeacon = enabled
	clearBucket("BedBeacon", true)

	if not enabled then
		return
	end

	scanWorkspace(true)
	local count = 0
	for _, bed in ipairs(State.CachedBeds) do
		if count >= Config.MaxMarkers then
			break
		end
		if bed.Parent then
			count = count + 1
			trackInstance("BedBeacon", makeBillboard(bed, "BED", Color3.fromRGB(255, 99, 132)))
			trackInstance("BedBeacon", makeHighlight(bed, Color3.fromRGB(255, 99, 132), 0.76))
		end
	end
	notify(
		"Bed Beacon",
		count > 0 and ("Marked " .. tostring(count) .. " bed objects.") or "No visible bed objects were found."
	)
end

local function setResourceBeacon(enabled)
	State.Features.ResourceBeacon = enabled
	clearBucket("ResourceBeacon", false)
	clearBucket("ResourceBeacon", true)

	if not enabled then
		return
	end

	local seen = {}
	local function markResource(object)
		if not State.Features.ResourceBeacon or seen[object] or not object:IsA("BasePart") then
			return
		end
		if not containsKeyword(object.Name, RESOURCE_KEYWORDS) then
			return
		end
		if #(State.FeatureInstances.ResourceBeacon or {}) >= Config.MaxMarkers then
			return
		end
		seen[object] = true
		trackInstance("ResourceBeacon", makeBillboard(object, object.Name:upper(), Color3.fromRGB(106, 255, 189)))
	end

	scanWorkspace(true)
	for _, resource in ipairs(State.CachedResources) do
		markResource(resource)
	end
	trackConnection("ResourceBeacon", Workspace.DescendantAdded:Connect(markResource))
end

local function createStatusLabel(name, position, size)
	local gui = Instance.new("ScreenGui")
	gui.Name = name
	gui.ResetOnSpawn = false
	gui.IgnoreGuiInset = true
	gui.Parent = getGuiParent()

	local label = Instance.new("TextLabel")
	label.Name = "Status"
	label.AnchorPoint = Vector2.new(1, 0)
	label.Position = position
	label.Size = size
	label.BackgroundColor3 = Color3.fromRGB(16, 18, 24)
	label.BackgroundTransparency = 0.18
	label.BorderSizePixel = 0
	label.Font = Enum.Font.GothamMedium
	label.TextColor3 = Color3.fromRGB(236, 243, 255)
	label.TextSize = 13
	label.TextXAlignment = Enum.TextXAlignment.Left
	label.TextYAlignment = Enum.TextYAlignment.Top
	label.TextWrapped = true
	label.Parent = gui

	local padding = Instance.new("UIPadding")
	padding.PaddingTop = UDim.new(0, 8)
	padding.PaddingBottom = UDim.new(0, 8)
	padding.PaddingLeft = UDim.new(0, 10)
	padding.PaddingRight = UDim.new(0, 10)
	padding.Parent = label

	return gui, label
end

local function setTeammateRadar(enabled)
	State.Features.TeammateRadar = enabled
	clearBucket("TeammateRadar", false)
	clearBucket("TeammateRadar", true)

	if not enabled then
		return
	end

	local gui, label = createStatusLabel("XyrexTeammateRadar", UDim2.new(1, -18, 0, 145), UDim2.fromOffset(245, 104))
	trackInstance("TeammateRadar", gui)

	trackConnection(
		"TeammateRadar",
		RunService.Heartbeat:Connect(function()
			local _, _, rootPart = getCharacterParts()
			local rows = { "Teammate Radar" }
			if rootPart and LocalPlayer.Team then
				local entries = {}
				for _, player in ipairs(Players:GetPlayers()) do
					local _, _, targetRoot = getCharacterParts(player)
					if player ~= LocalPlayer and player.Team == LocalPlayer.Team and targetRoot then
						table.insert(entries, {
							Name = player.DisplayName,
							Distance = (targetRoot.Position - rootPart.Position).Magnitude,
						})
					end
				end
				table.sort(entries, function(a, b)
					return a.Distance < b.Distance
				end)
				for index = 1, math.min(4, #entries) do
					table.insert(
						rows,
						("%s • %d studs"):format(entries[index].Name, math.floor(entries[index].Distance + 0.5))
					)
				end
			end
			if #rows == 1 then
				table.insert(rows, "No nearby teammates found.")
			end
			label.Text = table.concat(rows, "\n")
		end)
	)
end

local function setThreatHighlights(enabled)
	State.Features.ThreatHighlights = enabled
	clearBucket("ThreatHighlights", false)
	clearBucket("ThreatHighlights", true)

	if not enabled then
		return
	end

	local lastUpdate = 0
	trackConnection(
		"ThreatHighlights",
		RunService.Heartbeat:Connect(function()
			local now = os.clock()
			if now - lastUpdate < 0.8 then
				return
			end
			lastUpdate = now

			clearBucket("ThreatHighlights", true)
			local _, _, rootPart = getCharacterParts()
			if not rootPart then
				return
			end

			for _, player in ipairs(Players:GetPlayers()) do
				local character = player.Character
				local _, _, targetRoot = getCharacterParts(player)
				if
					character
					and isOpponent(player)
					and targetRoot
					and (targetRoot.Position - rootPart.Position).Magnitude <= Config.ThreatRange
				then
					trackInstance("ThreatHighlights", makeHighlight(character, Color3.fromRGB(255, 122, 64), 0.7))
				end
			end
		end)
	)
end

local function setHealthAlerts(enabled)
	State.Features.HealthAlerts = enabled
	clearBucket("HealthAlerts", false)

	if not enabled then
		return
	end

	local lastBand = "safe"
	local function watchCharacter(character)
		local humanoid = character and character:FindFirstChildOfClass("Humanoid")
		if not humanoid then
			return
		end

		trackConnection(
			"HealthAlerts",
			humanoid.HealthChanged:Connect(function()
				local maxHealth = math.max(humanoid.MaxHealth, 1)
				local percent = humanoid.Health / maxHealth
				local band = percent <= 0.25 and "critical" or percent <= 0.5 and "low" or "safe"
				if band ~= lastBand and band ~= "safe" then
					notify(
						"Health Alert",
						band == "critical" and "Critical health. Escape or heal now." or "Health is below half."
					)
				end
				lastBand = band
			end)
		)
	end

	if LocalPlayer.Character then
		watchCharacter(LocalPlayer.Character)
	end
	trackConnection("HealthAlerts", LocalPlayer.CharacterAdded:Connect(watchCharacter))
end

local function setVoidGuard(enabled)
	State.Features.VoidGuard = enabled
	clearBucket("VoidGuard", false)

	if not enabled then
		return
	end

	local lastWarn = 0
	trackConnection(
		"VoidGuard",
		RunService.Heartbeat:Connect(function()
			local _, humanoid, rootPart = getCharacterParts()
			if not humanoid or not rootPart or humanoid.Health <= 0 then
				return
			end

			local now = os.clock()
			if now - lastWarn < 2.5 then
				return
			end

			local params = RaycastParams.new()
			params.FilterType = Enum.RaycastFilterType.Exclude
			params.FilterDescendantsInstances = { LocalPlayer.Character }
			local hit = Workspace:Raycast(rootPart.Position, Vector3.new(0, -18, 0), params)
			if rootPart.Position.Y < 35 or hit == nil then
				lastWarn = now
				notify("Void Guard", "No safe floor detected below you.")
			end
		end)
	)
end

local function setLagWatcher(enabled)
	State.Features.LagWatcher = enabled
	clearBucket("LagWatcher", false)
	clearBucket("LagWatcher", true)

	if not enabled then
		return
	end

	local gui, label = createStatusLabel("XyrexLagWatcher", UDim2.new(1, -18, 0, 258), UDim2.fromOffset(245, 70))
	trackInstance("LagWatcher", gui)

	local frames = 0
	local totalDelta = 0
	local spikes = 0
	local lastUpdate = 0
	trackConnection(
		"LagWatcher",
		RunService.RenderStepped:Connect(function(deltaTime)
			frames = frames + 1
			totalDelta = totalDelta + deltaTime
			if deltaTime >= 0.12 then
				spikes = spikes + 1
			end

			local now = os.clock()
			if now - lastUpdate >= 0.5 then
				lastUpdate = now
				local average = totalDelta / math.max(frames, 1)
				label.Text = ("Lag Watcher\nAverage FPS: %d\nSpikes: %d"):format(
					math.floor((1 / math.max(average, 0.001)) + 0.5),
					spikes
				)
			end
		end)
	)
end

local function setSessionTimer(enabled)
	State.Features.SessionTimer = enabled
	clearBucket("SessionTimer", false)
	clearBucket("SessionTimer", true)

	if not enabled then
		return
	end

	local gui, label = createStatusLabel("XyrexSessionTimer", UDim2.new(1, -18, 0, 337), UDim2.fromOffset(245, 58))
	trackInstance("SessionTimer", gui)
	local startedAt = os.clock()

	trackConnection(
		"SessionTimer",
		RunService.Heartbeat:Connect(function()
			local elapsed = math.floor(os.clock() - startedAt)
			label.Text = ("Session Timer\n%02d:%02d"):format(math.floor(elapsed / 60), elapsed % 60)
		end)
	)
end

local function rememberSoundVolume(sound)
	if typeof(sound) ~= "Instance" or not sound:IsA("Sound") then
		return
	end
	if State.FocusMuteVolumes[sound] == nil then
		State.FocusMuteVolumes[sound] = sound.Volume
	end
end

local function muteAllSounds()
	State.FocusMuteMuted = true
	for _, object in ipairs(game:GetDescendants()) do
		if object:IsA("Sound") then
			rememberSoundVolume(object)
			object.Volume = math.min(object.Volume, 0.08)
		end
	end
end

local function restoreAllSounds()
	for sound, volume in pairs(State.FocusMuteVolumes) do
		if typeof(sound) == "Instance" and sound.Parent then
			pcall(function()
				sound.Volume = volume
			end)
		end
	end
	table.clear(State.FocusMuteVolumes)
	State.FocusMuteMuted = false
end

local function setFocusMute(enabled)
	State.Features.FocusMute = enabled
	clearBucket("FocusMute", false)
	restoreAllSounds()

	if not enabled then
		return
	end

	trackConnection("FocusMute", UserInputService.WindowFocusReleased:Connect(muteAllSounds))
	trackConnection("FocusMute", UserInputService.WindowFocused:Connect(restoreAllSounds))
	trackConnection(
		"FocusMute",
		game.DescendantAdded:Connect(function(object)
			if State.FocusMuteMuted and object:IsA("Sound") then
				rememberSoundVolume(object)
				object.Volume = math.min(object.Volume, 0.08)
			end
		end)
	)
end

local function setCameraComfort(enabled)
	State.Features.CameraComfort = enabled
	clearBucket("CameraComfort", false)

	refreshCamera()
	if Camera and not enabled then
		Camera.FieldOfView = State.OriginalFOV or 70
	end

	if not enabled then
		return
	end

	State.OriginalFOV = Camera and Camera.FieldOfView or 70
	trackConnection(
		"CameraComfort",
		RunService.RenderStepped:Connect(function()
			refreshCamera()
			local _, humanoid = getCharacterParts()
			if not Camera or not humanoid then
				return
			end

			local moving = humanoid.MoveDirection.Magnitude > 0.05
			local targetFOV = moving and math.min((State.OriginalFOV or 70) + 8, 90) or (State.OriginalFOV or 70)
			Camera.FieldOfView = Camera.FieldOfView + ((targetFOV - Camera.FieldOfView) * 0.08)
		end)
	)
end

--// GUI construction
local GuiParent = getGuiParent()
if not GuiParent then
	error("Xyrex BedFight could not start because no GUI parent is available.")
end

local existingGui = GuiParent:FindFirstChild("XyrexBedFightSuite")
if existingGui then
	existingGui:Destroy()
end

local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Name = "XyrexBedFightSuite"
ScreenGui.ResetOnSpawn = false
ScreenGui.IgnoreGuiInset = true
ScreenGui.Parent = GuiParent
trackInstance("Root", ScreenGui)

local Main = Instance.new("Frame")
Main.Name = "Main"
Main.Size = UDim2.fromOffset(390, 460)
Main.Position = UDim2.new(0.5, -195, 0.12, 0)
Main.BackgroundColor3 = Color3.fromRGB(13, 15, 22)
Main.BorderSizePixel = 0
Main.Parent = ScreenGui

local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 12)
corner.Parent = Main

local stroke = Instance.new("UIStroke")
stroke.Color = Color3.fromRGB(84, 119, 255)
stroke.Thickness = 1.2
stroke.Transparency = 0.25
stroke.Parent = Main

local Header = Instance.new("Frame")
Header.Name = "Header"
Header.Size = UDim2.new(1, 0, 0, 46)
Header.BackgroundColor3 = Color3.fromRGB(23, 27, 39)
Header.BorderSizePixel = 0
Header.Parent = Main

local headerCorner = Instance.new("UICorner")
headerCorner.CornerRadius = UDim.new(0, 12)
headerCorner.Parent = Header

local Title = Instance.new("TextLabel")
Title.Name = "Title"
Title.Size = UDim2.new(1, -88, 1, 0)
Title.Position = UDim2.fromOffset(14, 0)
Title.BackgroundTransparency = 1
Title.Text = "Xyrex BedFight Suite"
Title.TextColor3 = Color3.fromRGB(244, 247, 255)
Title.Font = Enum.Font.GothamBold
Title.TextSize = 18
Title.TextXAlignment = Enum.TextXAlignment.Left
Title.Parent = Header

local Subtitle = Instance.new("TextLabel")
Subtitle.Name = "Subtitle"
Subtitle.Size = UDim2.new(1, -92, 0, 16)
Subtitle.Position = UDim2.fromOffset(15, 27)
Subtitle.BackgroundTransparency = 1
Subtitle.Text = "RightShift to toggle • rewritten with AetherCore-style utilities"
Subtitle.TextColor3 = Color3.fromRGB(155, 166, 195)
Subtitle.Font = Enum.Font.GothamMedium
Subtitle.TextSize = 10
Subtitle.TextXAlignment = Enum.TextXAlignment.Left
Subtitle.Parent = Header

local CloseButton = Instance.new("TextButton")
CloseButton.Name = "CloseButton"
CloseButton.Size = UDim2.fromOffset(32, 28)
CloseButton.Position = UDim2.new(1, -40, 0, 9)
CloseButton.BackgroundColor3 = Color3.fromRGB(190, 60, 70)
CloseButton.Text = "X"
CloseButton.TextColor3 = Color3.fromRGB(255, 255, 255)
CloseButton.Font = Enum.Font.GothamBold
CloseButton.TextSize = 14
CloseButton.BorderSizePixel = 0
CloseButton.Parent = Header

local closeCorner = Instance.new("UICorner")
closeCorner.CornerRadius = UDim.new(0, 8)
closeCorner.Parent = CloseButton

local Scroller = Instance.new("ScrollingFrame")
Scroller.Name = "Scroller"
Scroller.Size = UDim2.new(1, -18, 1, -58)
Scroller.Position = UDim2.fromOffset(9, 52)
Scroller.BackgroundTransparency = 1
Scroller.BorderSizePixel = 0
Scroller.CanvasSize = UDim2.new(0, 0, 0, 0)
Scroller.ScrollBarThickness = 4
Scroller.ScrollBarImageColor3 = Color3.fromRGB(84, 119, 255)
Scroller.Parent = Main

local Layout = Instance.new("UIListLayout")
Layout.Padding = UDim.new(0, 7)
Layout.SortOrder = Enum.SortOrder.LayoutOrder
Layout.Parent = Scroller

local function updateCanvasSize()
	Scroller.CanvasSize = UDim2.new(0, 0, 0, Layout.AbsoluteContentSize.Y + 12)
end

Layout:GetPropertyChangedSignal("AbsoluteContentSize"):Connect(updateCanvasSize)

local function makeCategory(title)
	local label = Instance.new("TextLabel")
	label.Size = UDim2.new(1, -4, 0, 26)
	label.BackgroundColor3 = Color3.fromRGB(27, 32, 47)
	label.BorderSizePixel = 0
	label.Text = "  " .. title
	label.TextColor3 = Color3.fromRGB(210, 220, 255)
	label.Font = Enum.Font.GothamBold
	label.TextSize = 13
	label.TextXAlignment = Enum.TextXAlignment.Left
	label.Parent = Scroller

	local labelCorner = Instance.new("UICorner")
	labelCorner.CornerRadius = UDim.new(0, 8)
	labelCorner.Parent = label
	return label
end

local function makeToggle(title, default, callback)
	local row = Instance.new("Frame")
	row.Size = UDim2.new(1, -4, 0, 34)
	row.BackgroundColor3 = Color3.fromRGB(21, 24, 35)
	row.BorderSizePixel = 0
	row.Parent = Scroller

	local rowCorner = Instance.new("UICorner")
	rowCorner.CornerRadius = UDim.new(0, 8)
	rowCorner.Parent = row

	local label = Instance.new("TextLabel")
	label.Size = UDim2.new(1, -78, 1, 0)
	label.Position = UDim2.fromOffset(12, 0)
	label.BackgroundTransparency = 1
	label.Text = title
	label.TextColor3 = Color3.fromRGB(235, 240, 255)
	label.Font = Enum.Font.GothamSemibold
	label.TextSize = 13
	label.TextXAlignment = Enum.TextXAlignment.Left
	label.Parent = row

	local button = Instance.new("TextButton")
	button.Size = UDim2.fromOffset(54, 24)
	button.Position = UDim2.new(1, -62, 0.5, -12)
	button.BorderSizePixel = 0
	button.Font = Enum.Font.GothamBold
	button.TextSize = 12
	button.TextColor3 = Color3.fromRGB(255, 255, 255)
	button.AutoButtonColor = false
	button.Parent = row

	local buttonCorner = Instance.new("UICorner")
	buttonCorner.CornerRadius = UDim.new(0, 7)
	buttonCorner.Parent = button

	State.Features[title:gsub("%s+", "")] = default
	setText(button, default)

	button.MouseButton1Click:Connect(function()
		default = not default
		setText(button, default)
		callback(default)
	end)

	if default then
		task.defer(callback, true)
	end

	return button
end

local function makeSlider(title, minValue, maxValue, default, step, callback)
	local row = Instance.new("Frame")
	row.Size = UDim2.new(1, -4, 0, 50)
	row.BackgroundColor3 = Color3.fromRGB(21, 24, 35)
	row.BorderSizePixel = 0
	row.Parent = Scroller

	local rowCorner = Instance.new("UICorner")
	rowCorner.CornerRadius = UDim.new(0, 8)
	rowCorner.Parent = row

	local label = Instance.new("TextLabel")
	label.Size = UDim2.new(1, -22, 0, 20)
	label.Position = UDim2.fromOffset(12, 3)
	label.BackgroundTransparency = 1
	label.Text = ("%s: %s"):format(title, tostring(default))
	label.TextColor3 = Color3.fromRGB(235, 240, 255)
	label.Font = Enum.Font.GothamSemibold
	label.TextSize = 12
	label.TextXAlignment = Enum.TextXAlignment.Left
	label.Parent = row

	local bar = Instance.new("Frame")
	bar.Size = UDim2.new(1, -24, 0, 14)
	bar.Position = UDim2.fromOffset(12, 28)
	bar.BackgroundColor3 = Color3.fromRGB(47, 54, 76)
	bar.BorderSizePixel = 0
	bar.Parent = row

	local barCorner = Instance.new("UICorner")
	barCorner.CornerRadius = UDim.new(0, 7)
	barCorner.Parent = bar

	local fill = Instance.new("Frame")
	fill.Size = UDim2.new((default - minValue) / (maxValue - minValue), 0, 1, 0)
	fill.BackgroundColor3 = Color3.fromRGB(84, 119, 255)
	fill.BorderSizePixel = 0
	fill.Parent = bar

	local fillCorner = Instance.new("UICorner")
	fillCorner.CornerRadius = UDim.new(0, 7)
	fillCorner.Parent = fill

	local function setFromFraction(fraction)
		fraction = math.clamp(fraction, 0, 1)
		local value = minValue + ((maxValue - minValue) * fraction)
		value = math.floor((value / step) + 0.5) * step
		value = math.clamp(value, minValue, maxValue)
		if step < 1 then
			value = math.floor(value * 10 + 0.5) / 10
		end
		fill.Size = UDim2.new((value - minValue) / (maxValue - minValue), 0, 1, 0)
		label.Text = ("%s: %s"):format(title, tostring(value))
		callback(value)
	end

	bar.InputBegan:Connect(function(input)
		if input.UserInputType ~= Enum.UserInputType.MouseButton1 then
			return
		end

		local moveConnection
		local endConnection
		local function update()
			local mouse = UserInputService:GetMouseLocation()
			setFromFraction((mouse.X - bar.AbsolutePosition.X) / bar.AbsoluteSize.X)
		end

		update()
		moveConnection = UserInputService.InputChanged:Connect(function(changed)
			if changed.UserInputType == Enum.UserInputType.MouseMovement then
				update()
			end
		end)
		endConnection = UserInputService.InputEnded:Connect(function(ended)
			if ended.UserInputType == Enum.UserInputType.MouseButton1 then
				safeDisconnect(moveConnection)
				safeDisconnect(endConnection)
			end
		end)
	end)
end

local function makeButton(title, callback)
	local button = Instance.new("TextButton")
	button.Size = UDim2.new(1, -4, 0, 34)
	button.BackgroundColor3 = Color3.fromRGB(31, 36, 52)
	button.BorderSizePixel = 0
	button.Text = "  " .. title
	button.TextColor3 = Color3.fromRGB(235, 240, 255)
	button.Font = Enum.Font.GothamSemibold
	button.TextSize = 13
	button.TextXAlignment = Enum.TextXAlignment.Left
	button.Parent = Scroller

	local buttonCorner = Instance.new("UICorner")
	buttonCorner.CornerRadius = UDim.new(0, 8)
	buttonCorner.Parent = button

	button.MouseButton1Click:Connect(callback)
	return button
end

--// Draggable window
local dragging = false
local dragStart = nil
local startPosition = nil
trackConnection(
	"Global",
	Header.InputBegan:Connect(function(input)
		if input.UserInputType == Enum.UserInputType.MouseButton1 then
			dragging = true
			dragStart = input.Position
			startPosition = Main.Position
		end
	end)
)

trackConnection(
	"Global",
	Header.InputEnded:Connect(function(input)
		if input.UserInputType == Enum.UserInputType.MouseButton1 then
			dragging = false
		end
	end)
)

trackConnection(
	"Global",
	UserInputService.InputChanged:Connect(function(input)
		if dragging and input.UserInputType == Enum.UserInputType.MouseMovement then
			local delta = input.Position - dragStart
			Main.Position = UDim2.new(
				startPosition.X.Scale,
				startPosition.X.Offset + delta.X,
				startPosition.Y.Scale,
				startPosition.Y.Offset + delta.Y
			)
		end
	end)
)

--// UI sections
makeCategory("Combat")
makeToggle("No Knockback", false, setNoKnockback)
makeToggle("Kill Aura", false, setKillAura)
makeSlider("Kill Aura Range", 5, 30, Config.KillAuraRange, 1, function(value)
	Config.KillAuraRange = value
end)
makeSlider("Kill Aura Delay", 0.05, 0.5, Config.KillAuraDelay, 0.05, function(value)
	Config.KillAuraDelay = value
end)

makeCategory("Movement")
makeToggle("Speed", false, setSpeed)
makeSlider("Speed Value", 16, 200, Config.Speed, 1, updateSpeed)
makeToggle("Infinite Jump", false, setInfiniteJump)
makeToggle("Fly", false, setFly)
makeSlider("Fly Speed", 20, 200, Config.FlySpeed, 5, function(value)
	Config.FlySpeed = value
end)

makeCategory("Automation")
makeToggle("AutoWin", false, setAutoWin)
makeSlider("AutoWin Delay", 0.1, 2, Config.AutoWinDelay, 0.1, function(value)
	Config.AutoWinDelay = value
end)
makeToggle("AutoClicker", false, setAutoClicker)
makeSlider("AutoClicker CPS", 1, 30, Config.AutoClickerCPS, 1, function(value)
	Config.AutoClickerCPS = value
end)

makeCategory("Visuals")
makeToggle("Player ESP", false, setPlayerESP)
makeToggle("Bed Beacon Overlay", false, setBedBeacon)
makeToggle("Resource Beacon Overlay", false, setResourceBeacon)
makeToggle("Threat Ring Highlights", false, setThreatHighlights)

makeCategory("Match Utilities")
makeToggle("Health Pulse Alerts", false, setHealthAlerts)
makeToggle("Void Guard Ping", false, setVoidGuard)
makeToggle("Teammate Radar HUD", false, setTeammateRadar)
makeToggle("Lag Spike Watcher", false, setLagWatcher)
makeToggle("Session Timer HUD", false, setSessionTimer)
makeToggle("Focus Mute Guard", false, setFocusMute)
makeToggle("Camera Comfort Boost", false, setCameraComfort)

makeCategory("Teleports")
makeButton("Teleport to Nearest Bed", function()
	local bed = getNearestBed()
	if bed then
		teleportTo(bed.Position + Vector3.new(0, 5, 0))
	else
		notify("Teleport", "No visible bed was found.")
	end
end)
makeButton("Teleport to Nearest Opponent", function()
	local target = getNearestOpponent(math.huge)
	local _, _, targetRoot = getCharacterParts(target)
	if targetRoot then
		teleportTo(targetRoot.Position + Vector3.new(0, 2, 2))
	else
		notify("Teleport", "No living opponent was found.")
	end
end)
makeButton("Refresh Bed and Resource Cache", function()
	scanWorkspace(true)
	notify("Cache Refreshed", ("Beds: %d • Resources: %d"):format(#State.CachedBeds, #State.CachedResources))
end)

makeCategory("Settings")
makeButton("Change Toggle Key", function()
	local promptGui = Instance.new("ScreenGui")
	promptGui.Name = "XyrexKeyPrompt"
	promptGui.ResetOnSpawn = false
	promptGui.Parent = GuiParent

	local prompt = Instance.new("Frame")
	prompt.Size = UDim2.fromOffset(280, 90)
	prompt.Position = UDim2.new(0.5, -140, 0.5, -45)
	prompt.BackgroundColor3 = Color3.fromRGB(18, 21, 31)
	prompt.BorderSizePixel = 0
	prompt.Parent = promptGui

	local promptCorner = Instance.new("UICorner")
	promptCorner.CornerRadius = UDim.new(0, 12)
	promptCorner.Parent = prompt

	local promptText = Instance.new("TextLabel")
	promptText.Size = UDim2.new(1, -24, 1, 0)
	promptText.Position = UDim2.fromOffset(12, 0)
	promptText.BackgroundTransparency = 1
	promptText.Text = "Press any keyboard key to set the GUI toggle."
	promptText.TextColor3 = Color3.fromRGB(244, 247, 255)
	promptText.Font = Enum.Font.GothamBold
	promptText.TextSize = 14
	promptText.TextWrapped = true
	promptText.Parent = prompt

	local connection
	connection = UserInputService.InputBegan:Connect(function(input, processed)
		if processed or input.UserInputType ~= Enum.UserInputType.Keyboard then
			return
		end
		Config.ToggleKey = input.KeyCode
		promptText.Text = "Toggle key set to " .. input.KeyCode.Name .. "."
		safeDisconnect(connection)
		task.wait(0.8)
		safeDestroy(promptGui)
	end)
end)

local function destroySuite()
	if State.Destroyed then
		return
	end

	State.Destroyed = true
	for feature in pairs(State.Features) do
		State.Features[feature] = false
		stopThread(feature)
	end

	setFly(false)
	setSpeed(false)
	setFocusMute(false)
	setCameraComfort(false)

	for bucketName in pairs(State.FeatureConnections) do
		clearBucket(bucketName, false)
	end
	for bucketName in pairs(State.FeatureInstances) do
		clearBucket(bucketName, true)
	end
end

makeButton("Destroy GUI and Disable Features", destroySuite)
trackConnection("Global", CloseButton.MouseButton1Click:Connect(destroySuite))

--// Global handlers
trackConnection(
	"Global",
	UserInputService.InputBegan:Connect(function(input, processed)
		if processed or State.Destroyed then
			return
		end
		if input.KeyCode == Config.ToggleKey then
			State.GuiEnabled = not State.GuiEnabled
			ScreenGui.Enabled = State.GuiEnabled
		end
	end)
)

trackConnection("Global", Workspace:GetPropertyChangedSignal("CurrentCamera"):Connect(refreshCamera))

trackConnection(
	"Global",
	LocalPlayer.CharacterAdded:Connect(function(character)
		task.wait(0.6)
		local humanoid = character:FindFirstChildOfClass("Humanoid")
		if humanoid then
			State.BaseWalkSpeed = humanoid.WalkSpeed
			State.BaseJumpPower = humanoid.JumpPower
			State.BaseJumpHeight = humanoid.JumpHeight
		end

		if State.Features.NoKnockback then
			setNoKnockback(true)
		end
		if State.Features.Speed then
			setSpeed(true)
		end
		if State.Features.Fly then
			setFly(true)
		end
	end)
)

scanWorkspace(true)
updateCanvasSize()
notify("Xyrex BedFight", "Loaded successfully. Press " .. Config.ToggleKey.Name .. " to toggle the GUI.")
