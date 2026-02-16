import ApiResponse from "../utils/Api-Response.js"
import { apiErrors } from "../utils/Api-errors.js"
import User from "../models/User.Model.js"
import { Project } from "../models/project.model.js"
import { ProjectMember } from "../models/projectmember.model.js"
import mongoose, { Schema } from 'mongoose'
import { UserRolesEnum, AvailableUserRole } from "../utils/Constants.js"


const getProjects = async (req, res, next) => {
    try {

    } catch (error) {
        return next(error)
    }
}

const getProjectById = async (req, res, next) => {
    try {

    } catch (error) {
        return next(error)
    }
}

const createProject = async (req, res, next) => {
    try {

    } catch (error) {
        return next(error)
    }
}

const updateProject = async (req, res, next) => {
    try {

    } catch (error) {
        return next(error)
    }
}



const deleteProject = async (req, res, next) => {
    try {

    } catch (error) {
        return next(error)
    }
}

const addMembersToProject = async (req, res, next) => {
    try {

    } catch (error) {
        return next(error)
    }
}

const getProjectMembers = async (req, res, next) => {
    try {

    } catch (error) {
        return next(error)
    }
}

const updateMemberRole = async (req, res, next) => {
    try {

    } catch (error) {
        return next(error)
    }
}
const deleteMember = async (req, res, next) => {
    try {

    } catch (error) {
        return next(error)
    }
}

export { getProjects, getProjectById, createProject, updateProject, deleteProject, addMembersToProject, getProjectMembers, updateMemberRole, deleteMember }