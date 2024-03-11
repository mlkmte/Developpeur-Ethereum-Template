const { ethers } = require("hardhat");
const { expect, assert } = require("chai");

describe("Test Voting Contract", function () {
  let deployedContract;
  let owner, addr1, addr2;

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    let contract = await ethers.getContractFactory("Voting");
    deployedContract = await contract.deploy();
  });

  describe("INITIALISATION DU CONTRAT", function () {
    it("Check si owner = déployeur du contrat", async function () {
      expect(await deployedContract.owner()).to.equal(owner.address);
    });

    it("Check si le contrat à bien été déployé", async function () {
      let number = await deployedContract.winningProposalID();
      assert(number.toString() === "0");
    });
  });

  describe("FONCTION addVoter", function () {
    it("Ajout d'un voteur impossible si ce n'est pas l'owner", async function () {
      await expect(
        deployedContract.connect(addr1).addVoter(addr2)
      ).to.be.revertedWithCustomError(
        deployedContract,
        "OwnableUnauthorizedAccount"
      );
    });

    it("Vérifier qu'on est bien sans le state RegisteringVoters", async function () {
      const workflowStatus = await deployedContract.workflowStatus();
      await expect(workflowStatus).to.equal(0);
    });

    it("Vérification si le voteur existe déjà", async function () {
      await deployedContract.addVoter(addr1);
      await expect(deployedContract.addVoter(addr1)).to.be.revertedWith(
        "Already registered"
      );
    });

    it("Vérification si l'event VoterRegistered a bien été émit", async function () {
      await expect(deployedContract.addVoter(addr1))
        .to.emit(deployedContract, "VoterRegistered")
        .withArgs(addr1);
    });
  });

  describe("FONCTION addProposal", function () {
    it("Fonction addProposal impossible si ce n'est pas un voteur", async function () {
      await expect(
        deployedContract.connect(addr1).addProposal("Chien")
      ).to.be.revertedWith("You're not a voter");
    });

    it("Vérifier qu'on est bien dans le state ProposalsRegistrationStarted", async function () {
      await deployedContract.startProposalsRegistering();
      const workflowStatus = await deployedContract.workflowStatus();
      await expect(workflowStatus).to.equal(1);
    });

    it("Ajout d'une proposal impossible si ce n'est pas un voteur", async function () {
      await expect(
        deployedContract.connect(addr1).addProposal("Chien")
      ).to.be.revertedWith("You're not a voter");
    });

    it("Vérifier que la préposition n'est pas vide", async function () {
      await deployedContract.addVoter(addr1);
      await deployedContract.startProposalsRegistering();
      await expect(
        deployedContract.connect(addr1).addProposal("")
      ).to.be.revertedWith("Vous ne pouvez pas ne rien proposer");
    });

    it("Voir si la proposal a bien été ajouté dans la liste", async function () {
      await deployedContract.addVoter(addr1);
      await deployedContract.startProposalsRegistering();
      await deployedContract.connect(addr1).addProposal("Chien");
      const newProposal = await deployedContract
        .connect(addr1)
        .getOneProposal(1);
      expect(newProposal.description).to.equal("Chien");
    });

    it("Vérification si l'event ProposalRegistered a bien été emit", async function () {
      await deployedContract.addVoter(addr1);
      await deployedContract.startProposalsRegistering();
      await expect(deployedContract.connect(addr1).addProposal("Chien"))
        .to.emit(deployedContract, "ProposalRegistered")
        .withArgs(1);
    });
  });

  describe("FONCTION setVote", function () {
    it("Fonction setVote impossible si ce n'est pas un voteur", async function () {
      await expect(
        deployedContract.connect(addr1).setVote(0)
      ).to.be.revertedWith("You're not a voter");
    });

    it("Vérifier qu'on est bien dans le state VotingSessionStarted", async function () {
      await deployedContract.startProposalsRegistering();
      await deployedContract.endProposalsRegistering();
      await deployedContract.startVotingSession();
      const workflowStatus = await deployedContract.workflowStatus();
      await expect(workflowStatus).to.equal(3);
    });

    it("Vérifier si le voteur a déjà voté", async function () {
      await deployedContract.addVoter(addr1);
      await deployedContract.startProposalsRegistering();
      await deployedContract.connect(addr1).addProposal("Chien");
      await deployedContract.endProposalsRegistering();
      await deployedContract.startVotingSession();
      await deployedContract.connect(addr1).setVote(0);
      await expect(
        deployedContract.connect(addr1).setVote(0)
      ).to.be.revertedWith("You have already voted");
    });

    it("Vérifier si la proposition a voter existe", async function () {
      await deployedContract.addVoter(addr1);
      await deployedContract.startProposalsRegistering();
      await deployedContract.connect(addr1).addProposal("Chien");
      await deployedContract.endProposalsRegistering();
      await deployedContract.startVotingSession();
      await expect(
        deployedContract.connect(addr1).setVote(20)
      ).to.be.revertedWith("Proposal not found");
    });

    // it("Vérifier que la fonction getVoter retourne bien le bon voteur", async function () {
    //   await deployedContract.addVoter(addr1);
    //   let voter = await deployedContract.connect(addr1).getVoter(addr1);
    //   let voterAddress = voter.address;
    //     //await assert(voter.address == addr1.address);
    //   console.log(voter);
    // });

    it("Vérifier si les infos du voteur ont bien été mise à jour une fois qu'il a voté", async function () {
      await deployedContract.addVoter(addr1);
      await deployedContract.startProposalsRegistering();
      await deployedContract.connect(addr1).addProposal("Chien");
      await deployedContract.endProposalsRegistering();
      await deployedContract.startVotingSession();
      await deployedContract.connect(addr1).setVote(1);
      let voter = await deployedContract.connect(addr1).getVoter(addr1);
      assert(voter.hasVoted == true && voter.votedProposalId == 1);
    });

    it("Vérifier que le voteCount a bien été pris en compte dans le tableau des proposition", async function () {
      await deployedContract.addVoter(addr1);
      await deployedContract.startProposalsRegistering();
      await deployedContract.connect(addr1).addProposal("Chien");
      await deployedContract.endProposalsRegistering();
      await deployedContract.startVotingSession();
      await deployedContract.connect(addr1).setVote(1);
      let proposal = await deployedContract.connect(addr1).getOneProposal(1);
      assert(proposal.voteCount.toString() === "1");
    });

    it("Vérification si l'event Voted a bien été emit", async function () {
      await deployedContract.addVoter(addr1);
      await deployedContract.startProposalsRegistering();
      await deployedContract.endProposalsRegistering();
      await deployedContract.startVotingSession();
      // setVote(0) = vote de la proposition de l'owner
      await expect(deployedContract.connect(addr1).setVote(0))
        .to.emit(deployedContract, "Voted")
        .withArgs(addr1.address, 0);
    });
  });

  describe("FONCTION tallyVotes", function () {
    it("Fonction tallyVotes impossible si ce n'est pas l'owner", async function () {
      await expect(
        deployedContract.connect(addr1).tallyVotes()
      ).to.be.revertedWithCustomError(
        deployedContract,
        "OwnableUnauthorizedAccount"
      );
    });

    it("Vérifier qu'on est bien dans le state VotingSessionEnded", async function () {
      await deployedContract.startProposalsRegistering();
      await deployedContract.endProposalsRegistering();
      await deployedContract.startVotingSession();
      await deployedContract.endVotingSession();
      const workflowStatus = await deployedContract.workflowStatus();
      await expect(workflowStatus).to.equal(4);
    });

    it("Vérifier que la proposition gagnante est bien la bonne", async function () {
      await deployedContract.addVoter(addr1);
      await deployedContract.addVoter(addr2);
      await deployedContract.startProposalsRegistering();
      await deployedContract.connect(addr1).addProposal("Chien");
      await deployedContract.endProposalsRegistering();
      await deployedContract.startVotingSession();
      await deployedContract.connect(addr1).setVote(1);
      await deployedContract.connect(addr2).setVote(1);
      await deployedContract.endVotingSession();
      await deployedContract.tallyVotes();
      let winProposal = await deployedContract.winningProposalID();
      assert(winProposal.toString() === "1");
    });

    it("Vérification si l'event VotesTallied a bien été emit", async function () {
      await deployedContract.addVoter(addr1);
      await deployedContract.startProposalsRegistering();
      await deployedContract.endProposalsRegistering();
      await deployedContract.startVotingSession();
      await deployedContract.connect(addr1).setVote(0);
      await deployedContract.endVotingSession();
      await expect(deployedContract.connect(owner).tallyVotes())
        .to.emit(deployedContract, "WorkflowStatusChange")
        .withArgs(4, 5);
    });
  });
});
