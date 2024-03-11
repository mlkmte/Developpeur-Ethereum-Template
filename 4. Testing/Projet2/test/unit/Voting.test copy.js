const { ethers } = require('hardhat');
const { expect, assert } = require('chai');


describe('Test Voting Contract', function() {
    let deployedContract;
    let owner, addr1, addr2;
  
    beforeEach(async function() {
      [owner, addr1, addr2] = await ethers.getSigners();
      let contract = await ethers.getContractFactory('Voting');
      deployedContract = await contract.deploy();
    })

    describe('INITIALISATION DU CONTRAT', function() {
        it("Check si owner = déployeur du contrat", async function () {
            expect(await deployedContract.owner()).to.equal(owner.address);
        });
    })


    describe('VERIFICATION DES EVENTS', function() {
        it('event VoterRegistered', async function() {
            await expect(deployedContract.addVoter(addr1))
            .to.emit(deployedContract, "VoterRegistered")
            .withArgs(addr1);
        })

    })

    describe('VERIFICATION DES REQUIRES', function() {

        it("addVoter : ajout d'un voteur impossible si ce n'est pas l'owner", async function() {
            await expect(deployedContract.connect(addr1).addVoter(addr2)).to.be.revertedWithCustomError
            (
                deployedContract,
                "OwnableUnauthorizedAccount"
            );
        })
      
        it('addVoter : vérifier si la sessionn d\'enregistrement du voteur est ouverte', async function() {
            let workflowStatusIndice = await deployedContract.workflowStatus;
            // const registrationOpenStatus = 1;
            // assert.equal(workflowStatusIndice, registrationOpenStatus);


            // await workflowStatusIndice.wait();
            // expect(workflowStatusIndice).to.equal(0);
            // assert(workflowStatusIndice.toString()==0)
            // console.log(workflowStatusIndice);
            // expect(workflowStatusIndice).to.equal(1).to.be.revertedWith(
            //         "Voters registration is not open yet"
            //     );       
        })

        it('addVoter : vérifier si le voteur existe déjà', async function() {
            await deployedContract.connect(owner).addVoter(addr1);
            await expect(deployedContract.connect(owner).addVoter(addr1)).to.be.revertedWith(
                "Already registered"
            );
        })

        

    })


    describe('Set and Get', function() {



        it('TEST FONCTIONS addProposal', async function() {
            await deployedContract.connect(owner).addVoter(addr1);
            await deployedContract.startProposalsRegistering();
            await deployedContract.connect(addr1).addProposal("Chien");
            const proposalsArrayCount = await deployedContract.connect(addr1).getOneProposal(1);  
            // Pour vérifier si la proposal est bien dans la liste
            expect(proposalsArrayCount.description).to.equal("Chien");
        })

        
        // await deployedContract.setWorkflowStatus(0);
        // const workflowStatus = await deployedContract.workflowStatus;
        // console.log("La valeur de myVariable est :", workflowStatus);

        // assert.equal(workflowStatus, 1);
    
        // it('should set the number and get an updated number', async function() {
        //   let transaction = await deployedContract.setNumber(100);
        //   await transaction.wait();
        //   let number = await deployedContract.getNumber();
        //   assert(number.toString() === "100");
        // })
      })
  
    
  })