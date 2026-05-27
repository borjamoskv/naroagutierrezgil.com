// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract FronteraAgentNFT is ERC721A, Ownable, ERC2981 {
    using Strings for uint256;

    // AESTHETIC OMEGA - CONFIG
    uint256 public constant MAX_SUPPLY = 1111;
    uint256 public constant MINT_PRICE = 0.011 ether; // ~$30 in Base
    
    string private _baseTokenURI;
    
    // AGENTIC INFRASTRUCTURE
    struct AgentState {
        string mentalState;       // "Analyzing CORTEX", "Idling", "Arbitraging"
        string complianceStatus;  // "SECURED", "BREACHED", "LIMINAL", "UNSTABLE"
        uint256 intelligenceLevel; // e.g. 1 to 100
        uint256 balanceCap;       // Exergy limit
    }

    struct Mission {
        string description;
        bool active;
        bool successful;
    }

    mapping(uint256 => AgentState) public agentStates;
    mapping(uint256 => Mission[]) public agentMissions;
    
    // Registry & TBA addresses
    address public erc6551Registry;
    address public erc6551Implementation;

    // Events
    event AgentMentalStateUpdated(uint256 indexed tokenId, string newState, string compliance);
    event AgentMissionAssigned(uint256 indexed tokenId, string description);
    event AgentMissionCompleted(uint256 indexed tokenId, string description, bool successful);

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI_,
        address registry_,
        address implementation_
    ) ERC721A(name, symbol) Ownable(msg.sender) {
        _baseTokenURI = baseURI_;
        erc6551Registry = registry_;
        erc6551Implementation = implementation_;
        
        // EIP-2981 default royalty: 7.5% to deployer
        _setDefaultRoyalty(msg.sender, 750);
    }

    // MINT FUNCTION
    function mint(uint256 quantity) external payable {
        require(_totalMinted() + quantity <= MAX_SUPPLY, "Frontera: Max supply reached");
        require(msg.value >= MINT_PRICE * quantity, "Frontera: Insufficient payment");
        
        uint256 startTokenId = _nextTokenId();
        _safeMint(msg.sender, quantity);
        
        // Initialize default states for minted tokens
        for (uint256 i = 0; i < quantity; i++) {
            uint256 tokenId = startTokenId + i;
            agentStates[tokenId] = AgentState({
                mentalState: "Awakened. Booting system daemons...",
                complianceStatus: "LIMINAL",
                intelligenceLevel: 10,
                balanceCap: 1 ether
            });
            emit AgentMentalStateUpdated(tokenId, "Awakened. Booting system daemons...", "LIMINAL");
        }
    }

    // STATE MUTATION (Called by owner, authorized operator, or off-chain brain daemon)
    mapping(address => bool) public isAuthorizedOperator;

    modifier onlyOperator() {
        require(msg.sender == owner() || isAuthorizedOperator[msg.sender], "Frontera: Not authorized operator");
        _;
    }

    function setAuthorizedOperator(address operator, bool status) external onlyOwner {
        isAuthorizedOperator[operator] = status;
    }

    function updateAgentState(
        uint256 tokenId,
        string calldata mentalState,
        string calldata complianceStatus,
        uint256 intelligenceLevel,
        uint256 balanceCap
    ) external onlyOperator {
        require(_exists(tokenId), "Frontera: Query for non-existent token");
        
        AgentState storage state = agentStates[tokenId];
        state.mentalState = mentalState;
        state.complianceStatus = complianceStatus;
        state.intelligenceLevel = intelligenceLevel;
        state.balanceCap = balanceCap;

        emit AgentMentalStateUpdated(tokenId, mentalState, complianceStatus);
    }

    function assignMission(uint256 tokenId, string calldata description) external onlyOperator {
        require(_exists(tokenId), "Frontera: Query for non-existent token");
        agentMissions[tokenId].push(Mission({
            description: description,
            active: true,
            successful: false
        }));
        emit AgentMissionAssigned(tokenId, description);
    }

    function completeMission(uint256 tokenId, uint256 missionIndex, bool successful) external onlyOperator {
        require(_exists(tokenId), "Frontera: Query for non-existent token");
        require(missionIndex < agentMissions[tokenId].length, "Frontera: Invalid mission index");
        
        Mission storage mission = agentMissions[tokenId][missionIndex];
        require(mission.active, "Frontera: Mission already finalized");
        
        mission.active = false;
        mission.successful = successful;

        emit AgentMissionCompleted(tokenId, mission.description, successful);
    }

    // GETTERS & METADATA RESOLUTION
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function setBaseURI(string memory baseURI_) external onlyOwner {
        _baseTokenURI = baseURI_;
    }

    // Explicit EIP-165 support
    function supportsInterface(bytes4 interfaceId) public view override(ERC721A, ERC2981) returns (bool) {
        return ERC721A.supportsInterface(interfaceId) || ERC2981.supportsInterface(interfaceId);
    }
}
