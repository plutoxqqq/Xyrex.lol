-- BedWars Vape GUI - Complete & Functional
-- Press RightShift to toggle GUI
-- Features: KillAura, Reach, Speed, Fly, ESP, Tracers, AutoToxic, Nuker, Scaffold, AimAssist, AutoClicker
-- Each module now has Keybind and expandable Settings

-- ==================== SERVICES ====================
local Players = game:GetService("Players")
local UserInputService = game:GetService("UserInputService")
local TextChatService = game:GetService("TextChatService")
local TweenService = game:GetService("TweenService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")
local Workspace = game:GetService("Workspace")

local lplr = Players.LocalPlayer
local mouse = lplr:GetMouse()
local camera = Workspace.CurrentCamera

-- ==================== STATE ====================
local moduleStates = {}          -- { [moduleName] = enabled }
local moduleConnections = {}     -- { [moduleName] = { connection1, connection2, ... } }
local moduleKeybinds = {}        -- { [moduleName] = keyCode or nil }
local moduleSettings = {}        -- { [moduleName] = { settingName = value } }
local guiEnabled = true
local autoToxicEnabled = false

-- ==================== CHAT UTILITY ====================
local function sayInChat(message)
    pcall(function()
        local channel = TextChatService.ChatInputBarConfiguration.TargetTextChannel
        if channel then
            channel:SendAsync(message)
        end
    end)
end

-- ==================== BEDWARS CONTROLLER FETCH ====================
local KnitClient, CombatController, BedwarsShopController, ClientHandler

local function fetchControllers()
    local knitPaths = {
        ReplicatedStorage:FindFirstChild("Packages") and ReplicatedStorage.Packages:FindFirstChild("Knit"),
        ReplicatedStorage:FindFirstChild("rbxts_include") and ReplicatedStorage.rbxts_include:FindFirstChild("node_modules"):FindFirstChild("@rbxts"):FindFirstChild("net"):FindFirstChild("out")
    }
    for _, knit in ipairs(knitPaths) do
        if knit then
            KnitClient = knit:FindFirstChild("Client")
            if KnitClient then break end
        end
    end
    if not KnitClient then return end
    local controllers = KnitClient:FindFirstChild("Controllers")
    if controllers then
        CombatController = controllers:FindFirstChild("CombatController")
        BedwarsShopController = controllers:FindFirstChild("BedwarsShopController")
        ClientHandler = controllers:FindFirstChild("ClientHandler")
    end
end
fetchControllers()

-- ==================== HELPER FUNCTIONS ====================
local function getCharacter(player)
    return player and player.Character
end

local function getHumanoid(char)
    return char and char:FindFirstChildOfClass("Humanoid")
end

local function getHRP(char)
    return char and char:FindFirstChild("HumanoidRootPart")
end

-- Get nearest enemy (players + NPCs)
local function getNearestEnemy(range)
    local myChar = getCharacter(lplr)
    if not myChar then return nil, nil end
    local myTeam = lplr.Team
    local myHRP = getHRP(myChar)
    if not myHRP then return nil, nil end

    local nearest = nil
    local shortest = range or math.huge

    -- Players
    for _, player in ipairs(Players:GetPlayers()) do
        if player == lplr then continue end
        if myTeam and player.Team == myTeam then continue end
        local char = getCharacter(player)
        local hrp = getHRP(char)
        if hrp then
            local hum = getHumanoid(char)
            if hum and hum.Health > 0 then
                local dist = (myHRP.Position - hrp.Position).Magnitude
                if dist < shortest then
                    shortest = dist
                    nearest = char
                end
            end
        end
    end

    -- NPCs (any model with Humanoid, not belonging to a player)
    for _, model in ipairs(Workspace:GetDescendants()) do
        if model:IsA("Model") and model ~= myChar then
            local hum = model:FindFirstChildOfClass("Humanoid")
            local hrp = model:FindFirstChild("HumanoidRootPart")
            if hum and hrp and hum.Health > 0 then
                local isPlayerChar = false
                for _, plr in ipairs(Players:GetPlayers()) do
                    if plr.Character == model then isPlayerChar = true break end
                end
                if not isPlayerChar then
                    local dist = (myHRP.Position - hrp.Position).Magnitude
                    if dist < shortest then
                        shortest = dist
                        nearest = model
                    end
                end
            end
        end
    end

    return nearest, shortest
end

-- Safe connection management
local function addConnection(moduleName, connection)
    if not moduleConnections[moduleName] then
        moduleConnections[moduleName] = {}
    end
    table.insert(moduleConnections[moduleName], connection)
end

local function cleanupModule(moduleName)
    if moduleConnections[moduleName] then
        for _, conn in ipairs(moduleConnections[moduleName]) do
            pcall(function() conn:Disconnect() end)
        end
        moduleConnections[moduleName] = nil
    end
end

-- ==================== FEATURE IMPLEMENTATIONS ====================

-- 1. KILLAURA
local function toggleKillAura(enabled)
    cleanupModule("KillAura")
    if not enabled then return end

    local connection = RunService.Heartbeat:Connect(function()
        if not moduleStates["KillAura"] then return end
        local myChar = getCharacter(lplr)
        local myHRP = getHRP(myChar)
        if not myHRP then return end

        local targetChar = getNearestEnemy(12)
        if targetChar then
            local targetHRP = getHRP(targetChar)
            if targetHRP then
                -- Face target
                myHRP.CFrame = CFrame.lookAt(myHRP.Position, targetHRP.Position)
                -- Attack
                local tool = myChar:FindFirstChildOfClass("Tool")
                if tool and tool:IsA("Tool") then
                    tool:Activate()
                end
            end
        end
    end)
    addConnection("KillAura", connection)
end

-- 2. REACH
local function toggleReach(enabled)
    cleanupModule("Reach")
    if not enabled then
        local char = getCharacter(lplr)
        if char then
            local tool = char:FindFirstChildOfClass("Tool")
            if tool and tool:FindFirstChild("Handle") then
                local handle = tool.Handle
                local orig = handle:FindFirstChild("OriginalReach")
                if orig then
                    handle.Size = Vector3.new(handle.Size.X, handle.Size.Y, orig.Value)
                    orig:Destroy()
                end
                handle.Transparency = 0
            end
        end
        return
    end

    local function applyReach()
        local char = getCharacter(lplr)
        if not char then return end
        local tool = char:FindFirstChildOfClass("Tool")
        if tool and tool:FindFirstChild("Handle") then
            local handle = tool.Handle
            if not handle:FindFirstChild("OriginalReach") then
                local orig = Instance.new("NumberValue", handle)
                orig.Name = "OriginalReach"
                orig.Value = handle.Size.Z
            end
            handle.Size = Vector3.new(handle.Size.X, handle.Size.Y, 12)
            handle.Transparency = 0.5
        end
    end

    applyReach()
    local conn1 = lplr.CharacterAdded:Connect(applyReach)
    local conn2 = RunService.Heartbeat:Connect(function()
        if not moduleStates["Reach"] then return end
        applyReach()
    end)
    addConnection("Reach", conn1)
    addConnection("Reach", conn2)
end

-- 3. SPEED (with configurable speed value)
moduleSettings["Speed"] = { speed = 24 }

local function toggleSpeed(enabled)
    cleanupModule("Speed")
    if not enabled then
        local char = getCharacter(lplr)
        if char then
            local hum = getHumanoid(char)
            if hum then
                hum.WalkSpeed = 16
                hum.JumpPower = 50
            end
        end
        return
    end

    local function applySpeed()
        local char = getCharacter(lplr)
        if not char then return end
        local hum = getHumanoid(char)
        if hum then
            hum.WalkSpeed = moduleSettings["Speed"].speed or 24
            hum.JumpPower = 60
        end
    end

    applySpeed()
    addConnection("Speed", lplr.CharacterAdded:Connect(applySpeed))
    addConnection("Speed", RunService.Heartbeat:Connect(function()
        if not moduleStates["Speed"] then return end
        applySpeed()
    end))
end

-- 4. FLY (horizontal level maintained)
local function toggleFly(enabled)
    cleanupModule("Fly")
    if not enabled then
        local char = getCharacter(lplr)
        if char then
            local hrp = getHRP(char)
            if hrp then
                local bv = hrp:FindFirstChild("FlyVelocity")
                if bv then bv:Destroy() end
            end
        end
        return
    end

    local function setupFly()
        local char = getCharacter(lplr)
        if not char then return end
        local hrp = getHRP(char)
        if not hrp then return end

        local bv = hrp:FindFirstChild("FlyVelocity") or Instance.new("BodyVelocity")
        bv.Name = "FlyVelocity"
        bv.MaxForce = Vector3.new(1e5, 1e5, 1e5)
        bv.Velocity = Vector3.zero
        bv.Parent = hrp

        return bv
    end

    local flyConnection = RunService.Heartbeat:Connect(function()
        if not moduleStates["Fly"] then return end
        local bv = setupFly()
        if not bv then return end

        local moveDir = Vector3.zero

        -- Horizontal (flatten camera vectors)
        local camLook = camera.CFrame.LookVector
        local camRight = camera.CFrame.RightVector
        local flatLook = Vector3.new(camLook.X, 0, camLook.Z).Unit
        local flatRight = Vector3.new(camRight.X, 0, camRight.Z).Unit

        if UserInputService:IsKeyDown(Enum.KeyCode.W) then moveDir += flatLook end
        if UserInputService:IsKeyDown(Enum.KeyCode.S) then moveDir -= flatLook end
        if UserInputService:IsKeyDown(Enum.KeyCode.A) then moveDir -= flatRight end
        if UserInputService:IsKeyDown(Enum.KeyCode.D) then moveDir += flatRight end

        -- Vertical
        if UserInputService:IsKeyDown(Enum.KeyCode.Space) then
            moveDir += Vector3.new(0, 1, 0)
        elseif UserInputService:IsKeyDown(Enum.KeyCode.LeftControl) then
            moveDir -= Vector3.new(0, 1, 0)
        end

        local speed = 40
        if moveDir.Magnitude > 0 then
            bv.Velocity = moveDir.Unit * speed
        else
            bv.Velocity = Vector3.zero
        end
    end)
    addConnection("Fly", flyConnection)
end

-- 5. ESP
local function toggleESP(enabled)
    cleanupModule("ESP")
    if not enabled then
        for _, obj in ipairs(Workspace:GetDescendants()) do
            if obj:IsA("Highlight") and obj.Name == "ESP_Highlight" then
                obj:Destroy()
            end
        end
        return
    end

    local function addESP(player)
        if player == lplr then return end
        local function onCharAdded(char)
            if not moduleStates["ESP"] then return end
            local highlight = Instance.new("Highlight")
            highlight.Name = "ESP_Highlight"
            highlight.FillColor = Color3.fromRGB(255, 0, 0)
            highlight.FillTransparency = 0.5
            highlight.OutlineColor = Color3.fromRGB(255, 255, 255)
            highlight.OutlineTransparency = 0
            highlight.Adornee = char
            highlight.Parent = char
        end
        if player.Character then onCharAdded(player.Character) end
        player.CharacterAdded:Connect(onCharAdded)
    end

    for _, player in ipairs(Players:GetPlayers()) do addESP(player) end
    addConnection("ESP", Players.PlayerAdded:Connect(addESP))
end

-- 6. TRACERS
local function toggleTracers(enabled)
    cleanupModule("Tracers")
    if not enabled then
        for _, obj in ipairs(Workspace:GetDescendants()) do
            if obj:IsA("Beam") and obj.Name == "TracerBeam" then obj:Destroy() end
        end
        return
    end

    local function createTracerForPlayer(player)
        if player == lplr then return end
        local char = player.Character
        if not char then return end
        local head = char:FindFirstChild("Head")
        if not head then return end

        local attach0 = Instance.new("Attachment")
        attach0.Name = "TracerAttach0"
        attach0.Parent = camera

        local attach1 = Instance.new("Attachment")
        attach1.Name = "TracerAttach1"
        attach1.Parent = head

        local beam = Instance.new("Beam")
        beam.Name = "TracerBeam"
        beam.Attachment0 = attach0
        beam.Attachment1 = attach1
        beam.Color = ColorSequence.new(Color3.fromRGB(255, 0, 0))
        beam.Width0 = 0.1
        beam.Width1 = 0.1
        beam.Parent = char

        local updateConn = RunService.RenderStepped:Connect(function()
            if not moduleStates["Tracers"] then return end
            if not attach0 or not attach0.Parent then return end
            if not camera then return end
            attach0.WorldPosition = camera.CFrame.Position
        end)
        addConnection("Tracers_" .. player.UserId, updateConn)
    end

    for _, player in ipairs(Players:GetPlayers()) do createTracerForPlayer(player) end
    local playerAddedConn = Players.PlayerAdded:Connect(createTracerForPlayer)
    addConnection("Tracers", playerAddedConn)
end

-- 7. AUTO TOXIC
local function setupAutoToxic()
    if not CombatController then return end
    local controller = require(CombatController)
    local killSignal = controller.kill or controller.onKill or controller.KillEvent
    if killSignal and typeof(killSignal) == "Instance" then
        killSignal:Connect(function(victim, isFinalKill)
            if autoToxicEnabled and isFinalKill and victim ~= lplr then
                sayInChat("ez final kill 💀")
            end
        end)
    end
end
setupAutoToxic()

-- 8. NUKER
local function toggleNuker(enabled)
    cleanupModule("Nuker")
    if not enabled then return end

    local connection = RunService.Heartbeat:Connect(function()
        if not moduleStates["Nuker"] then return end
        local myChar = getCharacter(lplr)
        if not myChar then return end

        for _, obj in ipairs(Workspace:GetDescendants()) do
            if obj.Name == "bed" and obj:IsA("BasePart") and obj.Parent and obj.Parent.Name ~= lplr.Name then
                local tool = myChar:FindFirstChildOfClass("Tool")
                if tool then
                    firetouchinterest(obj, tool.Handle, 0)
                    firetouchinterest(obj, tool.Handle, 1)
                end
            end
        end
    end)
    addConnection("Nuker", connection)
end

-- 9. SCAFFOLD (places team wool below player)
local function getTeamWoolName()
    local team = lplr.Team
    if not team then return "wool_white" end
    local teamName = team.Name:lower()
    if teamName:find("blue") then return "wool_blue"
    elseif teamName:find("red") then return "wool_red"
    elseif teamName:find("green") then return "wool_green"
    elseif teamName:find("yellow") then return "wool_yellow"
    elseif teamName:find("aqua") then return "wool_cyan"
    elseif teamName:find("pink") then return "wool_pink"
    elseif teamName:find("gray") then return "wool_gray"
    elseif teamName:find("white") then return "wool_white"
    else return "wool_white" end
end

local function toggleScaffold(enabled)
    cleanupModule("Scaffold")
    if not enabled then return end

    local connection = RunService.Heartbeat:Connect(function()
        if not moduleStates["Scaffold"] then return end
        local myChar = getCharacter(lplr)
        local hrp = getHRP(myChar)
        if not hrp then return end

        -- Check if we have wool
        local hasWool = false
        local woolName = getTeamWoolName()
        for _, tool in ipairs(myChar:GetChildren()) do
            if tool:IsA("Tool") and tool.Name:lower():find("wool") then
                hasWool = true
                break
            end
        end
        if not hasWool then return end

        -- Place block below player
        local placePos = hrp.Position - Vector3.new(0, 3, 0)
        if BedwarsShopController then
            pcall(function()
                local blockItem = require(BedwarsShopController):GetItem(woolName)
                if blockItem then
                    require(BedwarsShopController):PlaceBlock(blockItem, CFrame.new(placePos))
                end
            end)
        else
            -- Fallback: try remote
            local args = { [1] = "place_block", [2] = woolName, [3] = placePos }
            local remotes = ReplicatedStorage:FindFirstChild("Remotes")
            if remotes then
                local placeRemote = remotes:FindFirstChild("PlaceBlock")
                if placeRemote then
                    placeRemote:FireServer(unpack(args))
                end
            end
        end
    end)
    addConnection("Scaffold", connection)
end

-- 10. AIM ASSIST
local function toggleAimAssist(enabled)
    cleanupModule("AimAssist")
    if not enabled then return end

    local connection = RunService.RenderStepped:Connect(function()
        if not moduleStates["AimAssist"] then return end
        local nearest = getNearestEnemy(30)
        if not nearest then return end
        local head = nearest:FindFirstChild("Head")
        if not head then return end

        local screenPos, onScreen = camera:WorldToScreenPoint(head.Position)
        if not onScreen then return end

        local targetPos = Vector2.new(screenPos.X, screenPos.Y)
        local mousePos = Vector2.new(mouse.X, mouse.Y)
        local delta = (targetPos - mousePos) * 0.1  -- Smoothness factor
        mousemoverel(delta.X, delta.Y)
    end)
    addConnection("AimAssist", connection)
end

-- 11. AUTO CLICKER (works while holding left click)
local function toggleAutoClicker(enabled)
    cleanupModule("AutoClicker")
    if not enabled then return end

    local holding = false
    local conn1 = UserInputService.InputBegan:Connect(function(input, gpe)
        if gpe then return end
        if input.UserInputType == Enum.UserInputType.MouseButton1 then
            holding = true
        end
    end)
    local conn2 = UserInputService.InputEnded:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 then
            holding = false
        end
    end)
    local conn3 = RunService.Heartbeat:Connect(function()
        if holding and moduleStates["AutoClicker"] then
            mouse1click()
        end
    end)

    addConnection("AutoClicker", conn1)
    addConnection("AutoClicker", conn2)
    addConnection("AutoClicker", conn3)
end

-- ==================== GUI CONSTRUCTION ====================
local screenGui = Instance.new("ScreenGui")
screenGui.Name = "VapeUtility"
screenGui.ResetOnSpawn = false
screenGui.Parent = lplr:WaitForChild("PlayerGui")

local mainFrame = Instance.new("Frame")
mainFrame.Size = UDim2.new(0, 1000, 0, 520)
mainFrame.Position = UDim2.new(0.5, -500, 0.5, -260)
mainFrame.BackgroundColor3 = Color3.fromRGB(19, 19, 19)
mainFrame.BorderSizePixel = 0
mainFrame.Parent = screenGui

Instance.new("UICorner", mainFrame).CornerRadius = UDim.new(0, 12)

local topBar = Instance.new("Frame")
topBar.Size = UDim2.new(1, 0, 0, 48)
topBar.BackgroundColor3 = Color3.fromRGB(24, 24, 24)
topBar.BorderSizePixel = 0
topBar.Parent = mainFrame

Instance.new("UICorner", topBar).CornerRadius = UDim.new(0, 12)

local title = Instance.new("TextLabel")
title.Size = UDim2.new(0, 140, 1, 0)
title.Position = UDim2.new(0, 20, 0, 0)
title.BackgroundTransparency = 1
title.Text = "VAPE"
title.TextColor3 = Color3.fromRGB(180, 80, 255)
title.TextScaled = true
title.Font = Enum.Font.GothamBlack
title.TextXAlignment = Enum.TextXAlignment.Left
title.Parent = topBar

local sidebar = Instance.new("Frame")
sidebar.Size = UDim2.new(0, 160, 1, -48)
sidebar.Position = UDim2.new(0, 0, 0, 48)
sidebar.BackgroundColor3 = Color3.fromRGB(22, 22, 22)
sidebar.BorderSizePixel = 0
sidebar.Parent = mainFrame

local sidebarLayout = Instance.new("UIListLayout")
sidebarLayout.SortOrder = Enum.SortOrder.LayoutOrder
sidebarLayout.Padding = UDim.new(0, 2)
sidebarLayout.Parent = sidebar

local contentArea = Instance.new("Frame")
contentArea.Size = UDim2.new(1, -160, 1, -48)
contentArea.Position = UDim2.new(0, 160, 0, 48)
contentArea.BackgroundTransparency = 1
contentArea.Parent = mainFrame

-- Scrolling frame for columns
local contentScroller = Instance.new("ScrollingFrame")
contentScroller.Size = UDim2.new(1, 0, 1, 0)
contentScroller.Position = UDim2.new(0, 0, 0, 0)
contentScroller.BackgroundTransparency = 1
contentScroller.BorderSizePixel = 0
contentScroller.CanvasSize = UDim2.new(0, 0, 0, 0)
contentScroller.ScrollBarThickness = 4
contentScroller.ScrollingDirection = Enum.ScrollingDirection.X
contentScroller.AutomaticCanvasSize = Enum.AutomaticSize.X
contentScroller.Parent = contentArea

local columnsList = Instance.new("UIListLayout")
columnsList.FillDirection = Enum.FillDirection.Horizontal
columnsList.SortOrder = Enum.SortOrder.LayoutOrder
columnsList.Padding = UDim.new(0, 10)
columnsList.Parent = contentScroller

local categories = {"Combat", "Blatant", "Render", "Utility", "World", "Legit"}
local columns = {}
local columnOrder = 0

local function createCategory(name)
    local defaultOpen = (name == "Utility")
    local btn = Instance.new("TextButton")
    btn.Size = UDim2.new(1, 0, 0, 46)
    btn.BackgroundColor3 = defaultOpen and Color3.fromRGB(32, 32, 32) or Color3.fromRGB(22, 22, 22)
    btn.BorderSizePixel = 0
    btn.Text = "  " .. name
    btn.TextColor3 = Color3.fromRGB(220, 220, 220)
    btn.Font = Enum.Font.GothamSemibold
    btn.TextSize = 15
    btn.TextXAlignment = Enum.TextXAlignment.Left
    btn.Parent = sidebar

    local highlight = Instance.new("Frame")
    highlight.Name = "Highlight"
    highlight.Size = UDim2.new(0, 4, 1, 0)
    highlight.BackgroundColor3 = Color3.fromRGB(180, 80, 255)
    highlight.BorderSizePixel = 0
    highlight.Visible = defaultOpen
    highlight.Parent = btn

    local column = Instance.new("Frame")
    column.Name = name
    column.Size = UDim2.new(0, 200, 1, 0)   -- Fixed width
    column.BackgroundColor3 = Color3.fromRGB(26, 26, 26)
    column.BorderSizePixel = 0
    column.Visible = defaultOpen
    column.LayoutOrder = columnOrder
    column.Parent = contentScroller

    Instance.new("UICorner", column).CornerRadius = UDim.new(0, 10)

    local colTitle = Instance.new("TextLabel")
    colTitle.Size = UDim2.new(1, 0, 0, 42)
    colTitle.BackgroundTransparency = 1
    colTitle.Text = name
    colTitle.TextColor3 = Color3.fromRGB(255, 255, 255)
    colTitle.Font = Enum.Font.GothamBold
    colTitle.TextSize = 16
    colTitle.Parent = column

    -- Use UIListLayout to position modules
    local layout = Instance.new("UIListLayout")
    layout.Name = "ModuleList"
    layout.SortOrder = Enum.SortOrder.LayoutOrder
    layout.Padding = UDim.new(0, 8)
    layout.Parent = column

    columns[name] = column
    columnOrder += 1

    btn.MouseButton1Click:Connect(function()
        column.Visible = not column.Visible
        highlight.Visible = column.Visible
        btn.BackgroundColor3 = column.Visible and Color3.fromRGB(32, 32, 32) or Color3.fromRGB(22, 22, 22)
    end)
end

for _, cat in ipairs(categories) do
    createCategory(cat)
end

-- Module creation with Keybind and Settings
local keybindListening = false
local currentModuleForKeybind = nil
local keybindButton = nil

local function createModule(parent, name, defaultEnabled, toggleCallback)
    local frame = Instance.new("Frame")
    frame.Name = name .. "Module"
    frame.Size = UDim2.new(1, -16, 0, 58)
    frame.BackgroundColor3 = defaultEnabled and Color3.fromRGB(140, 80, 255) or Color3.fromRGB(35, 35, 35)
    frame.BorderSizePixel = 0
    frame.LayoutOrder = #parent:GetChildren()   -- Let UIListLayout handle order
    frame.Parent = parent

    Instance.new("UICorner", frame).CornerRadius = UDim.new(0, 10)

    -- Module label
    local label = Instance.new("TextLabel")
    label.Size = UDim2.new(0.6, 0, 1, 0)
    label.Position = UDim2.new(0, 10, 0, 0)
    label.BackgroundTransparency = 1
    label.Text = name
    label.TextColor3 = Color3.fromRGB(255, 255, 255)
    label.Font = Enum.Font.GothamSemibold
    label.TextSize = 15
    label.TextXAlignment = Enum.TextXAlignment.Left
    label.Parent = frame

    -- Keybind display button (left)
    local keybindBtn = Instance.new("TextButton")
    keybindBtn.Size = UDim2.new(0, 30, 0, 30)
    keybindBtn.Position = UDim2.new(1, -80, 0.5, -15)
    keybindBtn.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
    keybindBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
    keybindBtn.Text = moduleKeybinds[name] and moduleKeybinds[name].Name or "🔑"
    keybindBtn.Font = Enum.Font.Gotham
    keybindBtn.TextSize = 14
    keybindBtn.Parent = frame
    Instance.new("UICorner", keybindBtn).CornerRadius = UDim.new(0, 6)

    keybindBtn.MouseButton1Click:Connect(function()
        if keybindListening then return end
        keybindListening = true
        currentModuleForKeybind = name
        keybindButton = keybindBtn
        keybindBtn.Text = "..."
        keybindBtn.BackgroundColor3 = Color3.fromRGB(180, 80, 255)

        local conn
        conn = UserInputService.InputBegan:Connect(function(input, gpe)
            if gpe then return end
            if input.UserInputType == Enum.UserInputType.Keyboard then
                local key = input.KeyCode
                -- If same key as existing, remove keybind
                if moduleKeybinds[name] == key then
                    moduleKeybinds[name] = nil
                    keybindBtn.Text = "🔑"
                else
                    moduleKeybinds[name] = key
                    keybindBtn.Text = key.Name
                end
                keybindBtn.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
                keybindListening = false
                currentModuleForKeybind = nil
                keybindButton = nil
                conn:Disconnect()
            end
        end)
    end)

    -- Settings button (three dots)
    local settingsBtn = Instance.new("TextButton")
    settingsBtn.Size = UDim2.new(0, 30, 0, 30)
    settingsBtn.Position = UDim2.new(1, -40, 0.5, -15)
    settingsBtn.BackgroundColor3 = Color3.fromRGB(50, 50, 50)
    settingsBtn.Text = "⋮"
    settingsBtn.TextColor3 = Color3.fromRGB(255, 255, 255)
    settingsBtn.Font = Enum.Font.GothamBold
    settingsBtn.TextSize = 24
    settingsBtn.Parent = frame
    Instance.new("UICorner", settingsBtn).CornerRadius = UDim.new(0, 6)

    -- Settings panel (hidden initially)
    local settingsPanel = Instance.new("Frame")
    settingsPanel.Name = "SettingsPanel"
    settingsPanel.Size = UDim2.new(1, 0, 0, 0)
    settingsPanel.BackgroundColor3 = Color3.fromRGB(30, 30, 30)
    settingsPanel.BorderSizePixel = 0
    settingsPanel.ClipsDescendants = true
    settingsPanel.Visible = false
    settingsPanel.Parent = frame

    Instance.new("UICorner", settingsPanel).CornerRadius = UDim.new(0, 6)
    local settingsLayout = Instance.new("UIListLayout")
    settingsLayout.Padding = UDim.new(0, 4)
    settingsLayout.Parent = settingsPanel

    -- Add module-specific settings
    if name == "Speed" then
        local speedLabel = Instance.new("TextLabel")
        speedLabel.Size = UDim2.new(1, -10, 0, 20)
        speedLabel.Position = UDim2.new(0, 5, 0, 5)
        speedLabel.BackgroundTransparency = 1
        speedLabel.Text = "Speed: " .. tostring(moduleSettings["Speed"].speed)
        speedLabel.TextColor3 = Color3.fromRGB(200, 200, 200)
        speedLabel.Font = Enum.Font.Gotham
        speedLabel.TextSize = 14
        speedLabel.TextXAlignment = Enum.TextXAlignment.Left
        speedLabel.Parent = settingsPanel

        local slider = Instance.new("Frame")
        slider.Size = UDim2.new(1, -20, 0, 20)
        slider.Position = UDim2.new(0, 10, 0, 30)
        slider.BackgroundColor3 = Color3.fromRGB(60, 60, 60)
        slider.Parent = settingsPanel
        Instance.new("UICorner", slider).CornerRadius = UDim.new(0, 4)

        local fill = Instance.new("Frame")
        fill.Size = UDim2.new((moduleSettings["Speed"].speed - 10) / 40, 0, 1, 0)
        fill.BackgroundColor3 = Color3.fromRGB(140, 80, 255)
        fill.BorderSizePixel = 0
        fill.Parent = slider
        Instance.new("UICorner", fill).CornerRadius = UDim.new(0, 4)

        local dragging = false
        slider.InputBegan:Connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseButton1 then
                dragging = true
            end
        end)
        slider.InputEnded:Connect(function(input)
            if input.UserInputType == Enum.UserInputType.MouseButton1 then
                dragging = false
            end
        end)
        UserInputService.InputChanged:Connect(function(input)
            if dragging and input.UserInputType == Enum.UserInputType.MouseMovement then
                local relativeX = math.clamp((input.Position.X - slider.AbsolutePosition.X) / slider.AbsoluteSize.X, 0, 1)
                local speedVal = 10 + relativeX * 40
                moduleSettings["Speed"].speed = math.floor(speedVal)
                speedLabel.Text = "Speed: " .. moduleSettings["Speed"].speed
                fill.Size = UDim2.new(relativeX, 0, 1, 0)
                if moduleStates["Speed"] then
                    local char = getCharacter(lplr)
                    if char then
                        local hum = getHumanoid(char)
                        if hum then hum.WalkSpeed = moduleSettings["Speed"].speed end
                    end
                end
            end
        end)
    end

    -- Toggle settings panel with animation
    local settingsOpen = false
    settingsBtn.MouseButton1Click:Connect(function()
        settingsOpen = not settingsOpen
        local targetHeight = settingsOpen and 80 or 0   -- Adjust based on content
        local tween = TweenService:Create(settingsPanel, TweenInfo.new(0.25, Enum.EasingStyle.Quad), {Size = UDim2.new(1, 0, 0, targetHeight)})
        tween:Play()
        settingsPanel.Visible = true

        -- Shift modules below
        local layout = parent:FindFirstChild("ModuleList")
        if layout then
            for _, child in ipairs(parent:GetChildren()) do
                if child:IsA("Frame") and child.LayoutOrder > frame.LayoutOrder then
                    local yPos = child.Position
                    local tween2 = TweenService:Create(child, TweenInfo.new(0.25, Enum.EasingStyle.Quad), {Position = UDim2.new(yPos.X.Scale, yPos.X.Offset, yPos.Y.Scale, yPos.Y.Offset + (settingsOpen and targetHeight or -targetHeight))})
                    tween2:Play()
                end
            end
        end
    end)

    local enabled = defaultEnabled
    moduleStates[name] = enabled

    local function updateVisual()
        frame.BackgroundColor3 = enabled and Color3.fromRGB(140, 80, 255) or Color3.fromRGB(35, 35, 35)
    end

    frame.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 then
            enabled = not enabled
            moduleStates[name] = enabled
            updateVisual()
            if name == "AutoToxic" then
                autoToxicEnabled = enabled
            end
            if toggleCallback then
                toggleCallback(enabled)
            end
        end
    end)

    frame.MouseEnter:Connect(function()
        if not enabled then
            TweenService:Create(frame, TweenInfo.new(0.15), {BackgroundColor3 = Color3.fromRGB(45, 45, 45)}):Play()
        end
    end)
    frame.MouseLeave:Connect(updateVisual)

    updateVisual()
    if defaultEnabled and toggleCallback then
        toggleCallback(true)
    end
end

-- Instantiate modules
createModule(columns["Combat"], "KillAura", false, toggleKillAura)
createModule(columns["Combat"], "Reach", false, toggleReach)
createModule(columns["Blatant"], "Speed", false, toggleSpeed)
createModule(columns["Blatant"], "Fly", false, toggleFly)
createModule(columns["Render"], "ESP", false, toggleESP)
createModule(columns["Render"], "Tracers", false, toggleTracers)
createModule(columns["Utility"], "AutoToxic", false, nil)
createModule(columns["World"], "Nuker", false, toggleNuker)
createModule(columns["World"], "Scaffold", false, toggleScaffold)
createModule(columns["Legit"], "AimAssist", false, toggleAimAssist)
createModule(columns["Legit"], "AutoClicker", false, toggleAutoClicker)

-- ==================== DRAGGING ====================
local function makeDraggable(frame, dragBar)
    local dragging = false
    local dragStart, startPos

    dragBar.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 then
            dragging = true
            dragStart = input.Position
            startPos = frame.Position
        end
    end)

    dragBar.InputEnded:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 then
            dragging = false
        end
    end)

    UserInputService.InputChanged:Connect(function(input)
        if dragging and input.UserInputType == Enum.UserInputType.MouseMovement then
            local delta = input.Position - dragStart
            frame.Position = UDim2.new(
                startPos.X.Scale,
                startPos.X.Offset + delta.X,
                startPos.Y.Scale,
                startPos.Y.Offset + delta.Y
            )
        end
    end)
end

makeDraggable(mainFrame, topBar)
for _, col in pairs(columns) do
    makeDraggable(col, col:FindFirstChildWhichIsA("TextLabel"))
end

-- ==================== KEYBIND HANDLER ====================
UserInputService.InputBegan:Connect(function(input, gameProcessed)
    if gameProcessed then return end
    if keybindListening then return end

    -- Toggle modules via keybinds
    for moduleName, key in pairs(moduleKeybinds) do
        if input.KeyCode == key then
            local enabled = not moduleStates[moduleName]
            moduleStates[moduleName] = enabled
            -- Update visual (find the frame and change color)
            for _, col in pairs(columns) do
                local moduleFrame = col:FindFirstChild(moduleName .. "Module")
                if moduleFrame then
                    moduleFrame.BackgroundColor3 = enabled and Color3.fromRGB(140, 80, 255) or Color3.fromRGB(35, 35, 35)
                end
            end
            -- Trigger toggle callback
            if moduleName == "KillAura" then toggleKillAura(enabled)
            elseif moduleName == "Reach" then toggleReach(enabled)
            elseif moduleName == "Speed" then toggleSpeed(enabled)
            elseif moduleName == "Fly" then toggleFly(enabled)
            elseif moduleName == "ESP" then toggleESP(enabled)
            elseif moduleName == "Tracers" then toggleTracers(enabled)
            elseif moduleName == "AutoToxic" then autoToxicEnabled = enabled
            elseif moduleName == "Nuker" then toggleNuker(enabled)
            elseif moduleName == "Scaffold" then toggleScaffold(enabled)
            elseif moduleName == "AimAssist" then toggleAimAssist(enabled)
            elseif moduleName == "AutoClicker" then toggleAutoClicker(enabled)
            end
            break
        end
    end

    -- GUI toggle
    if input.KeyCode == Enum.KeyCode.RightShift then
        guiEnabled = not guiEnabled
        screenGui.Enabled = guiEnabled
    end
end)

-- ==================== RESPAWN HANDLING ====================
lplr.CharacterAdded:Connect(function(char)
    for name, enabled in pairs(moduleStates) do
        if enabled then
            if name == "KillAura" then toggleKillAura(true)
            elseif name == "Reach" then toggleReach(true)
            elseif name == "Speed" then toggleSpeed(true)
            elseif name == "Fly" then toggleFly(true)
            elseif name == "ESP" then toggleESP(true)
            elseif name == "Tracers" then toggleTracers(true)
            elseif name == "Nuker" then toggleNuker(true)
            elseif name == "Scaffold" then toggleScaffold(true)
            elseif name == "AimAssist" then toggleAimAssist(true)
            elseif name == "AutoClicker" then toggleAutoClicker(true)
            end
        end
    end
end)
