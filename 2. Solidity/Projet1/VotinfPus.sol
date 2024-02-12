// SPDX-License-Identifier: GPL-3.0
pragma solidity >=0.6.12 <0.9.0;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

error Unauthorized();
error UnauthorizedState();
error VoterAlreadyExists();   
error ProposalAlreadyExists();   


// J'ai rajouté :
// - Une fonction qui permet de vérifier le state actuel du vote
// - Une fonction permettant à l'admin de vérifier la liste des votants
// - Une fonction permettant à l'admin de supprimer un votant en cas d'erreur
contract VotingPlus is Ownable {

    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint votedProposalId;
    }
    struct Proposal {
        string description;
        uint voteCount;
    }

    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    event VoterRegistered(address voterAddress); 
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);
    event ProposalRegistered(uint proposalId);
    event Voted (address voter, uint proposalId);

    // Liste de voteurs enregistré par l'adresse
    mapping(address => Voter) voters;
    address[] public voterAddresses;
    // Liste de proposition
    Proposal[] proposals;
    // Instance pour l'état du vote
    WorkflowStatus public voteState;
    


    constructor() Ownable(msg.sender) {
        voteState = WorkflowStatus.RegisteringVoters;
        changeWorkflowStatusState(voteState);
    }



    function changeWorkflowStatusState(WorkflowStatus _newStatus) public {
        WorkflowStatus previousStatus = voteState;
        voteState = _newStatus;
        emit WorkflowStatusChange(previousStatus, _newStatus);
    }


    // Modifier pour controler l'etat d'inscription des électeurs. 
    // Permet de ne pas inscrire de nouvelle personne une fois qu'on est passé à un autre state du vote.
    // Il faudra donc recommencer le vote pour éviter toutes tricheries
    modifier onlyStateRegisteringVoters() {
        if(voteState != WorkflowStatus.RegisteringVoters){
            revert UnauthorizedState();
        }
        _;
    }
    // Modifier qui va permettre de vérifier si un user est inscrit et à le droit de voter
    modifier onlyVoter() {
        // Fonction "if" pour utiliser moin de GAZ
        if(voters[msg.sender].isRegistered == false){
            revert Unauthorized();
        }
        _;
    }
    // Modifier pour controler la session d'enregistrement
    modifier onlyStateProposalsRegistration() {
        if(voteState != WorkflowStatus.ProposalsRegistrationStarted){
            revert UnauthorizedState();
        }
        _;
    }
    // Modifiers pour controler la session de vote
    modifier onlyStateVotingSessionStarted() {
        if(voteState != WorkflowStatus.VotingSessionStarted){
            revert UnauthorizedState();
        }
        if(voters[msg.sender].hasVoted == true){
            revert Unauthorized();
        }
        _;
    }
    modifier onlyStateVotingSessionEnd() {
        if(voteState != WorkflowStatus.VotingSessionEnded){
            revert UnauthorizedState();
        }
        _;
    }
    modifier onlyStateVotesTallied() {
        if(voteState != WorkflowStatus.VotesTallied){
            revert UnauthorizedState();
        }
        _;
    }
    

    //***Gestion de l'état de la session de vote par l'administrateur
    function startProposalsRegistration() external onlyOwner {
        voteState = WorkflowStatus.ProposalsRegistrationStarted;
        changeWorkflowStatusState(voteState);
    }
    function endProposalsRegistration() external onlyOwner {
        voteState = WorkflowStatus.ProposalsRegistrationEnded;
        changeWorkflowStatusState(voteState);
    }
    function startVotingSession() external onlyOwner {
        voteState = WorkflowStatus.VotingSessionStarted;
        changeWorkflowStatusState(voteState);
    }
    function endVotingSession() external onlyOwner {
        voteState = WorkflowStatus.VotingSessionEnded;
        changeWorkflowStatusState(voteState);
    }
    function votesTallied() external onlyOwner {
        voteState = WorkflowStatus.VotesTallied;
        changeWorkflowStatusState(voteState);
    }
    
    //***Enregistrement d'une liste blanche d'électeurs.
    // Attention l'admin doit lui même s'inscrire pour être éligible au vote
    function addVoter(address _voterAddress) external onlyOwner onlyStateRegisteringVoters {
        if(voters[_voterAddress].isRegistered == true){
            revert VoterAlreadyExists();
        }
        voters[_voterAddress] = Voter(true, false, 0);
        voterAddresses.push(_voterAddress);
        emit VoterRegistered(msg.sender);
    }

    //***Enregistrement d'une proposition
    function addProposal(string memory _description) external onlyVoter onlyStateProposalsRegistration {
        uint longueurTableau = proposals.length;
        for(uint i = 0 ; i < longueurTableau; i++) {
            if(compareStrings(proposals[i].description,_description)){
                revert ProposalAlreadyExists();
            }
        }
 
        Proposal memory proposal = Proposal(_description,0);
        proposals.push(proposal);
        emit ProposalRegistered(proposals.length);
    }

    //***Consulter la liste des propositions pour les voteurs uniquement
    function getProposals() external onlyVoter view returns (string[] memory) {
        uint longueurTableau = proposals.length;
        // Je déclare mon tableau temporaire
        string[] memory proposalsVote = new string[](longueurTableau);
        for(uint i = 0 ; i < longueurTableau; i++) {
            proposalsVote[i] = proposals[i].description;
        }
        return proposalsVote;
    }

    //***Voter pour la proposition
    function vote(uint _index) external onlyVoter onlyStateVotingSessionStarted {
        proposals[_index].voteCount += 1;
        voters[msg.sender].hasVoted = true;
        voters[msg.sender].votedProposalId = _index;
        emit Voted(msg.sender,_index);
    }

    //***Le voteur peut vérifier son vote ou le vote des autres
    function getVoterDetails(address _voterAddress) external onlyVoter onlyStateVotingSessionEnd view returns (Voter memory) {
        return voters[_voterAddress];
    }    

    //***Retourner la liste des propositions avec les votes comptabilisé
    // uniquement possible si l'administrateur à mis fin à la session de vote
    function getProposalsWithVote() external onlyStateVotingSessionEnd view returns (Proposal[] memory) {
        return proposals;
    }

    //***Retourner la proposition gagnante
    function getWinner() external onlyVoter onlyStateVotingSessionEnd view returns (Proposal memory) {
        Proposal memory winner;
        uint nbVote = 0;
        for(uint i=0;i<proposals.length;i++){
           if(nbVote<proposals[i].voteCount){
               winner = proposals[i];
           }
       }
       return winner;
    }



    // Fonction qui va permettre de checker si une proposition exist déjà ds la liste
    function compareStrings(string memory a, string memory b) private pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }


    // Fonction permettant à l'admin de vérifier la liste des votants
    function getVotersList() external onlyOwner view returns (address[] memory) {
        return voterAddresses;
    }   
    function removeVoter(address _voterAddress) external onlyOwner {
        uint tableLength = voterAddresses.length; 
        for (uint i = 0; i < tableLength; i++) {
            if(voterAddresses[i] == _voterAddress){
                delete voterAddresses[i];
            }
        }
        delete voters[_voterAddress];
    }

    function getCurrentState() external onlyVoter view returns (WorkflowStatus) {
        return voteState;
    }






}

 
